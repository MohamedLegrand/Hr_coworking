"""
Logique métier du module paiements.

Workflow :
1. L'utilisateur initie un paiement → on crée un Paiement (PENDING)
   et on appelle l'API HR-Skills Pay (placeholder pour le MVP)
2. HR-Skills Pay envoie un webhook → on met à jour le statut
3. Si SUCCESS → on confirme la réservation ET on envoie une notification
4. Si FAILED  → la réservation reste en_attente (l'utilisateur peut réessayer)
"""

import uuid
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.modules.authentification.modeles import Utilisateur
from app.api.v1.modules.notifications.service import notifier_confirmation_reservation
from app.api.v1.modules.paiements.modeles import Paiement
from app.api.v1.modules.reservations.modeles import Reservation
from app.api.v1.modules.reservations.service import confirmer_reservation
from app.noyau.configuration import settings


_STATUTS_WEBHOOK_VALIDES = {"PENDING", "SUCCESS", "FAILED", "HOLD"}


def _generer_reference() -> str:
    return f"HRC-{uuid.uuid4().hex[:12].upper()}"


def _appeler_api_hrskillspay(
    reference: str,
    montant: Decimal,
    operateur: str,
    numero_telephone: str | None,
    description: str,
) -> dict:
    """
    Appel à l'API HR-Skills Pay pour initier un CASHIN.
    Placeholder pour le MVP — affiche dans les logs.

    TODO (production) :
        import httpx
        response = httpx.post(
            f"{settings.HR_SKILLS_PAY_BASE_URL}/cashin",
            headers={"Authorization": f"Bearer {settings.HR_SKILLS_PAY_API_KEY}"},
            json={"reference": reference, "amount": float(montant), ...}
        )
        return response.json()
    """
    print(
        f"[HR-SKILLS PAY] Initiation CASHIN — "
        f"ref: {reference} | montant: {montant} XAF | "
        f"opérateur: {operateur} | téléphone: {numero_telephone}"
    )
    return {"status": "PENDING", "transaction_id": None}


def _verifier_kyc_et_cgu(utilisateur: Utilisateur, reservation: Reservation) -> None:
    """
    Garde-fou serveur avant tout paiement : KYC présent (statut valide ou
    en_attente, pas manquant ni refusé) et CGU acceptées sur CETTE
    réservation précise. Les admins ne sont pas des clients coworking et
    sont exemptés (cf. outil de réservation manuelle en administration).
    """
    if utilisateur.role == "admin":
        return

    kyc_manquant_ou_refuse = (
        not utilisateur.cni_url
        or utilisateur.document_statut == "invalide"
        or (utilisateur.type_compte == "entreprise" and not utilisateur.document_entreprise_url)
    )
    if kyc_manquant_ou_refuse:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vos documents d'identification (KYC) sont manquants ou refusés. "
            "Complétez-les avant de payer.",
        )
    if not reservation.cgu_acceptees:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous devez accepter les conditions d'utilisation de cette réservation avant de payer.",
        )


def initier_paiement(
    db: Session,
    utilisateur_id: str,
    reservation_id: str,
    operateur: str,
    numero_telephone: str | None,
    description: str | None = None,
) -> Paiement:
    reservation = (
        db.query(Reservation)
        .filter(
            Reservation.id == reservation_id,
            Reservation.utilisateur_id == utilisateur_id,
        )
        .first()
    )
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Réservation introuvable.",
        )
    if reservation.statut == "annulee":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impossible de payer une réservation annulée.",
        )
    if reservation.statut == "confirmee":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cette réservation est déjà confirmée et payée.",
        )

    utilisateur = db.query(Utilisateur).filter(Utilisateur.id == utilisateur_id).first()
    _verifier_kyc_et_cgu(utilisateur, reservation)

    paiement_existant = (
        db.query(Paiement)
        .filter(
            Paiement.reservation_id == reservation_id,
            Paiement.statut == "PENDING",
        )
        .first()
    )
    if paiement_existant:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un paiement est déjà en cours pour cette réservation.",
        )

    reference = _generer_reference()
    montant = Decimal(str(reservation.prix_total))
    libelle = description or f"Réservation HR Coworking — {str(reservation_id)[:8]}"

    reponse_api = _appeler_api_hrskillspay(
        reference=reference,
        montant=montant,
        operateur=operateur,
        numero_telephone=numero_telephone,
        description=libelle,
    )

    nouveau_paiement = Paiement(
        reference=reference,
        id_transaction=reponse_api.get("transaction_id"),
        utilisateur_id=utilisateur_id,
        reservation_id=reservation_id,
        direction="CASHIN",
        montant=montant,
        frais=Decimal("0"),
        montant_net=montant,
        devise="XAF",
        operateur=operateur,
        pays="CM",
        numero_telephone=numero_telephone,
        statut="PENDING",
        cle_idempotence=uuid.uuid4().hex,
        description=libelle,
    )

    db.add(nouveau_paiement)
    db.commit()
    db.refresh(nouveau_paiement)
    return nouveau_paiement


def traiter_webhook(db: Session, payload: dict) -> dict:
    """
    Traite la notification envoyée par HR-Skills Pay.
    - SUCCESS → confirme la réservation + envoie une notification à l'utilisateur
    - FAILED  → met à jour le statut seulement
    Retourne toujours 200 pour éviter les re-tentatives inutiles de l'agrégateur.
    """
    reference = payload.get("reference")
    nouveau_statut = payload.get("status")

    if nouveau_statut not in _STATUTS_WEBHOOK_VALIDES:
        return {"message": "Statut inconnu, ignoré."}

    paiement = db.query(Paiement).filter(Paiement.reference == reference).first()
    if not paiement:
        return {"message": "Référence inconnue, ignorée."}

    paiement.statut = nouveau_statut
    paiement.id_transaction = payload.get("transaction_id") or paiement.id_transaction
    paiement.frais = Decimal(str(payload.get("fee", 0)))
    paiement.montant_net = Decimal(str(payload.get("net_amount", paiement.montant)))

    if nouveau_statut == "SUCCESS":
        confirmer_reservation(db, str(paiement.reservation_id))

        utilisateur = db.query(Utilisateur).filter(
            Utilisateur.id == paiement.utilisateur_id
        ).first()

        if utilisateur:
            notifier_confirmation_reservation(
                db,
                utilisateur_id=str(paiement.utilisateur_id),
                email_utilisateur=utilisateur.email,
                reservation_id=str(paiement.reservation_id),
                prix_total=str(paiement.montant_net or paiement.montant),
            )

    db.commit()
    return {"message": "Webhook traité avec succès."}


def lister_mes_paiements(db: Session, utilisateur_id: str) -> list[Paiement]:
    return (
        db.query(Paiement)
        .filter(Paiement.utilisateur_id == utilisateur_id)
        .order_by(Paiement.cree_le.desc())
        .all()
    )


def obtenir_paiement(
    db: Session,
    paiement_id: str,
    utilisateur_id: str | None = None,
) -> Paiement:
    requete = db.query(Paiement).filter(Paiement.id == paiement_id)
    if utilisateur_id:
        requete = requete.filter(Paiement.utilisateur_id == utilisateur_id)
    paiement = requete.first()
    if not paiement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paiement introuvable.",
        )
    return paiement


def lister_tous_paiements(db: Session) -> list[Paiement]:
    return (
        db.query(Paiement)
        .order_by(Paiement.cree_le.desc())
        .all()
    )
