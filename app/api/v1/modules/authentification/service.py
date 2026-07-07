"""
Logique métier du module authentification.
"""

from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, UploadFile, status
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
from app.noyau.utilitaires_fichiers import sauvegarder_fichier

EXTENSIONS_AUTORISEES = {".pdf", ".jpg", ".jpeg", ".png"}
DUREE_TOKEN_RESET_MINUTES = 15


def _sauvegarder_fichier(fichier: UploadFile) -> str:
    return sauvegarder_fichier(
        fichier, settings.UPLOAD_DOCUMENTS_DIR, EXTENSIONS_AUTORISEES
    )


def creer_utilisateur(
    db: Session,
    email: str,
    mot_de_passe: str,
    nom: str,
    prenom: str,
    type_compte: str,
    cni: UploadFile,
    telephone: str | None = None,
    nom_entreprise: str | None = None,
    document_entreprise: UploadFile | None = None,
) -> Utilisateur:
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

    if type_compte == "entreprise":
        if not nom_entreprise:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Le nom de l'entreprise est obligatoire pour un compte entreprise.",
            )
        if document_entreprise is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Le document entreprise est obligatoire pour un compte entreprise.",
            )

    cni_url = _sauvegarder_fichier(cni)
    document_entreprise_url = (
        _sauvegarder_fichier(document_entreprise) if document_entreprise else None
    )

    nouvel_utilisateur = Utilisateur(
        email=email,
        mot_de_passe_hash=hash_password(mot_de_passe),
        nom=nom,
        prenom=prenom,
        telephone=telephone,
        type_compte=type_compte,
        nom_entreprise=nom_entreprise if type_compte == "entreprise" else None,
        cni_url=cni_url,
        document_entreprise_url=document_entreprise_url,
        document_statut="en_attente",
        document_date_upload=datetime.now(timezone.utc),
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
