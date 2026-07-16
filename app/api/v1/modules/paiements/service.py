"""
Logique métier du module paiements.

Workflow :
1. L'utilisateur initie un paiement → on crée un Paiement (PENDING)
   et on appelle le SDK HR-Skills Pay
2. HR-Skills Pay envoie un webhook → on met à jour le statut
3. Si SUCCESS → on confirme la réservation ET on envoie une notification
4. Si FAILED  → la réservation reste en_attente (l'utilisateur peut réessayer)
"""

import uuid
from decimal import Decimal

from fastapi import HTTPException, status
from hrpay.errors import (
    APIError,
    AuthenticationError,
    HRPayError,
    RateLimitError,
    ValidationError,
    WalletError,
)
from sqlalchemy.orm import Session

from app.api.v1.modules.authentification.modeles import Utilisateur
from app.api.v1.modules.notifications.service import (
    notifier_admins_paiement_recu,
    notifier_confirmation_reservation,
)
from app.api.v1.modules.paiements.modeles import Paiement
from app.api.v1.modules.reservations.modeles import Reservation
from app.api.v1.modules.reservations.service import confirmer_reservation
from app.noyau.configuration import settings
from app.noyau.hrskillspay import client_partage, formater_numero_cameroun

# Correspondance entre les événements HR-Skills Pay et les statuts internes
EVENEMENTS_STATUT = {
    "payment.succeeded": "SUCCESS",
    "payment.failed": "FAILED",
    "payment.hold": "HOLD",
    "payment.refunded": "REFUNDED",
}


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
        not utilisateur.cni_recto_url
        or not utilisateur.cni_verso_url
        or not utilisateur.photo_identite_url
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
    numero_telephone: str,
    description: str | None = None,
) -> Paiement:
    """
    Initie un Cash-In Mobile Money via le SDK HR-Skills Pay.

    Séquence :
    1. Vérifications métier (KYC/CGU, réservation valide, pas de paiement en cours)
    2. Création du Paiement en base AVANT l'appel réseau, avec sa clé
       d'idempotence — garantit qu'un retry ne double-débite jamais le client
    3. Appel au SDK
    4. Mise à jour avec la référence, les frais et le net réels de l'API
    """
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

    montant = int(Decimal(str(reservation.prix_total)))
    # TEMPORAIRE — seuil abaissé pour tester la collecte avec un petit montant
    # pendant que le wallet HR-Skills Pay est sous-approvisionné. À remettre
    # à 100 après les tests.
    if montant < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le montant minimum de paiement est de 100 XAF.",
        )

    telephone = formater_numero_cameroun(numero_telephone)
    libelle = description or f"Réservation HR Coworking — {str(reservation_id)[:8]}"
    cle_idempotence = str(uuid.uuid4())

    # Persister le paiement AVANT l'appel réseau : la clé d'idempotence est
    # déjà en base, donc une erreur réseau ne fait pas perdre la trace de la
    # transaction et un retry ne créera pas de double débit.
    nouveau_paiement = Paiement(
        reference=f"tmp_{cle_idempotence}",  # remplacé par la ref HR-Skills Pay
        utilisateur_id=utilisateur_id,
        reservation_id=reservation_id,
        direction="CASHIN",
        montant=Decimal(montant),
        frais=Decimal("0"),
        montant_net=Decimal(montant),
        devise=settings.HR_SKILLS_PAY_DEVISE,
        operateur=operateur,
        pays=settings.HR_SKILLS_PAY_PAYS,
        numero_telephone=telephone,
        statut="PENDING",
        cle_idempotence=cle_idempotence,
        description=libelle,
    )
    db.add(nouveau_paiement)
    db.commit()
    db.refresh(nouveau_paiement)

    try:
        reponse = client_partage().cash_in.mobile_money(
            phone_number=telephone,
            operator=operateur,               # "MTN" ou "ORANGE" (MAJUSCULES)
            amount=montant,
            currency=settings.HR_SKILLS_PAY_DEVISE,
            country=settings.HR_SKILLS_PAY_PAYS,
            description=libelle,
            metadata={
                "reservation_id": str(reservation_id),
                "utilisateur_id": str(utilisateur_id),
            },
            idempotency_key=cle_idempotence,
        )
    except AuthenticationError as e:
        # 401/403 : clés invalides OU KYC non approuvé (clés live bloquées)
        nouveau_paiement.statut = "FAILED"
        nouveau_paiement.description = f"{libelle} — auth : {e.code}"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                f"Configuration de paiement invalide ({e.code}). "
                "Vérifiez les clés HR-Skills Pay et l'approbation KYC du compte."
            ),
        )
    except ValidationError as e:
        nouveau_paiement.statut = "FAILED"
        nouveau_paiement.description = f"{libelle} — validation : {e.code}"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Paiement refusé ({e.code}) : {getattr(e, 'issues', e)}",
        )
    except RateLimitError as e:
        nouveau_paiement.statut = "FAILED"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Trop de requêtes. Réessayez dans {e.retry_after_seconds}s.",
        )
    except (APIError, WalletError) as e:
        nouveau_paiement.statut = "FAILED"
        nouveau_paiement.description = f"{libelle} — échec : {e.code}"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Échec de l'initiation du paiement ({e.code}) : {e}",
        )
    except HRPayError as e:
        # Réseau, timeout, circuit breaker
        nouveau_paiement.statut = "FAILED"
        nouveau_paiement.description = f"{libelle} — erreur : {type(e).__name__}"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Service de paiement injoignable : {type(e).__name__}",
        )

    # Enregistrer la référence et les montants réels renvoyés par l'API.
    # C'est la référence HR-Skills Pay (ref_...) qui arrivera dans le webhook.
    nouveau_paiement.reference = reponse.reference
    nouveau_paiement.id_transaction = reponse.transaction_id
    nouveau_paiement.statut = reponse.status or "PENDING"
    nouveau_paiement.frais = Decimal(str(reponse.fee or 0))
    nouveau_paiement.montant_net = Decimal(str(reponse.net_amount or montant))
    db.commit()
    db.refresh(nouveau_paiement)
    return nouveau_paiement


def traiter_webhook(db: Session, evenement_type: str, donnees: dict) -> dict:
    """
    Traite un événement HR-Skills Pay.

    IMPORTANT : la signature est DÉJÀ vérifiée par le routeur avant l'appel
    de cette fonction. Ne jamais l'appeler avec des données non vérifiées.

    - SUCCESS → confirme la réservation + notifie l'utilisateur et les admins
    - FAILED  → la réservation reste en_attente (nouvelle tentative possible)
    Retourne toujours un succès pour éviter les re-tentatives inutiles côté
    HR-Skills Pay.
    """
    reference = donnees.get("reference")
    if not reference:
        return {"message": "Référence absente, ignorée."}

    nouveau_statut = EVENEMENTS_STATUT.get(evenement_type) or donnees.get("status")
    if not nouveau_statut:
        return {"message": "Statut absent, ignoré."}

    paiement = db.query(Paiement).filter(Paiement.reference == reference).first()
    if not paiement:
        return {"message": "Référence inconnue, ignorée."}

    # Idempotence : un webhook rejoué ne doit pas re-déclencher les effets
    # (double confirmation, double notification)
    if paiement.statut == nouveau_statut:
        return {"message": "Webhook déjà traité."}

    paiement.statut = nouveau_statut
    paiement.id_transaction = donnees.get("transaction_id") or paiement.id_transaction
    if donnees.get("fee") is not None:
        paiement.frais = Decimal(str(donnees["fee"]))
    if donnees.get("net_amount") is not None:
        paiement.montant_net = Decimal(str(donnees["net_amount"]))

    if nouveau_statut == "SUCCESS":
        reservation = confirmer_reservation(db, str(paiement.reservation_id))
        utilisateur = (
            db.query(Utilisateur)
            .filter(Utilisateur.id == paiement.utilisateur_id)
            .first()
        )
        if utilisateur:
            notifier_confirmation_reservation(
                db,
                utilisateur_id=str(paiement.utilisateur_id),
                email_utilisateur=utilisateur.email,
                reservation_id=str(paiement.reservation_id),
                prix_total=str(paiement.montant_net or paiement.montant),
            )
            notifier_admins_paiement_recu(
                db,
                reservation_id=str(paiement.reservation_id),
                gamme=reservation.gamme,
                forfait=reservation.forfait,
                nombre_bureaux=len(reservation.details),
                prix_total=str(paiement.montant_net or paiement.montant),
                operateur=paiement.operateur,
                numero_telephone=paiement.numero_telephone,
                client_nom=utilisateur.nom,
                client_prenom=utilisateur.prenom,
                client_email=utilisateur.email,
            )

    db.commit()
    return {"message": "Webhook traité avec succès."}


def synchroniser_statut(db: Session, paiement_id: str) -> Paiement:
    """
    Filet de sécurité : interroge HR-Skills Pay pour rafraîchir le statut
    d'un paiement PENDING, au cas où le webhook ne serait jamais arrivé.
    """
    paiement = db.query(Paiement).filter(Paiement.id == paiement_id).first()
    if not paiement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paiement introuvable.",
        )
    if paiement.statut != "PENDING":
        return paiement
    if paiement.reference.startswith("tmp_"):
        return paiement  # n'est jamais parvenu jusqu'à HR-Skills Pay

    try:
        transaction = client_partage().transactions.status(paiement.reference)
    except HRPayError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Impossible de vérifier le statut : {e}",
        )

    donnees = transaction.model_dump()
    statut_actuel = donnees.get("status")
    if statut_actuel and statut_actuel != paiement.statut:
        traiter_webhook(db, "", donnees)
        db.refresh(paiement)
    return paiement


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
