"""
Logique métier du module authentification.
"""

from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.modules.authentification.modeles import Utilisateur
from app.api.v1.modules.notifications.service import notifier_reinitialisation_mot_de_passe
from app.noyau.configuration import settings
from app.noyau.securite import (
    creer_access_token,
    decoder_access_token,
    hash_password,
    verifier_password,
)

DUREE_TOKEN_RESET_MINUTES = 15


def creer_utilisateur(
    db: Session,
    email: str,
    mot_de_passe: str,
    nom: str,
    prenom: str,
    type_compte: str,
    telephone: str | None = None,
    nom_entreprise: str | None = None,
) -> Utilisateur:
    """
    Crée le compte sans documents : le KYC est demandé plus tard, et les CGU
    sont acceptées à chaque réservation (POST /reservations/{id}/valider-cgu-kyc).
    """
    if db.query(Utilisateur).filter(Utilisateur.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un compte existe déjà avec cet email.",
        )

    if len(mot_de_passe) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Le mot de passe doit contenir au moins 8 caractères.",
        )

    if type_compte == "entreprise" and not nom_entreprise:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Le nom de l'entreprise est obligatoire pour un compte entreprise.",
        )

    nouvel_utilisateur = Utilisateur(
        email=email,
        mot_de_passe_hash=hash_password(mot_de_passe),
        nom=nom,
        prenom=prenom,
        telephone=telephone,
        type_compte=type_compte,
        nom_entreprise=nom_entreprise if type_compte == "entreprise" else None,
        document_statut="en_attente",
    )

    db.add(nouvel_utilisateur)
    db.commit()
    db.refresh(nouvel_utilisateur)
    return nouvel_utilisateur


def authentifier_utilisateur(db: Session, email: str, mot_de_passe: str) -> Utilisateur:
    utilisateur = db.query(Utilisateur).filter(Utilisateur.email == email).first()
    if not utilisateur or not verifier_password(mot_de_passe, utilisateur.mot_de_passe_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not utilisateur.est_actif:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ce compte a été désactivé.",
        )
    return utilisateur


def demander_reinitialisation_mot_de_passe(db: Session, email: str) -> None:
    utilisateur = db.query(Utilisateur).filter(Utilisateur.email == email).first()
    if not utilisateur:
        return

    token_reset = creer_access_token(
        data={"sub": str(utilisateur.id), "type": "reset_password"},
        expires_delta=timedelta(minutes=DUREE_TOKEN_RESET_MINUTES),
    )
    lien_reset = f"{settings.FRONTEND_URL}/reinitialiser-mot-de-passe?token={token_reset}"
    notifier_reinitialisation_mot_de_passe(
        db,
        utilisateur_id=str(utilisateur.id),
        email_utilisateur=utilisateur.email,
        lien_reset=lien_reset,
    )


def reinitialiser_mot_de_passe(db: Session, token: str, nouveau_mot_de_passe: str) -> None:
    token_invalide = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Lien de réinitialisation invalide ou expiré.",
    )
    try:
        payload = decoder_access_token(token)
    except Exception:
        raise token_invalide

    if payload.get("type") != "reset_password":
        raise token_invalide

    utilisateur_id = payload.get("sub")
    utilisateur = db.query(Utilisateur).filter(Utilisateur.id == utilisateur_id).first()
    if not utilisateur:
        raise token_invalide

    if len(nouveau_mot_de_passe) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Le mot de passe doit contenir au moins 8 caractères.",
        )

    utilisateur.mot_de_passe_hash = hash_password(nouveau_mot_de_passe)
    db.commit()
