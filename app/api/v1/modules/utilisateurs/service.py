"""
Logique métier du module utilisateurs.
"""

from datetime import datetime, timezone

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.v1.modules.authentification.modeles import Utilisateur
from app.noyau.configuration import settings
from app.noyau.securite import hash_password, verifier_password
from app.noyau.utilitaires_fichiers import sauvegarder_fichier

EXTENSIONS_AUTORISEES = {".pdf", ".jpg", ".jpeg", ".png"}


def _sauvegarder_document(fichier: UploadFile) -> str:
    return sauvegarder_fichier(
        fichier, settings.UPLOAD_DOCUMENTS_DIR, EXTENSIONS_AUTORISEES
    )


def modifier_profil(
    db: Session,
    utilisateur: Utilisateur,
    nom: str | None = None,
    prenom: str | None = None,
    telephone: str | None = None,
    nom_entreprise: str | None = None,
) -> Utilisateur:
    if nom is not None:
        utilisateur.nom = nom
    if prenom is not None:
        utilisateur.prenom = prenom
    if telephone is not None:
        utilisateur.telephone = telephone
    if nom_entreprise is not None:
        if utilisateur.type_compte != "entreprise":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Le nom d'entreprise ne s'applique qu'aux comptes entreprise.",
            )
        utilisateur.nom_entreprise = nom_entreprise

    db.commit()
    db.refresh(utilisateur)
    return utilisateur


def changer_mot_de_passe(
    db: Session,
    utilisateur: Utilisateur,
    ancien_mot_de_passe: str,
    nouveau_mot_de_passe: str,
) -> None:
    if not verifier_password(ancien_mot_de_passe, utilisateur.mot_de_passe_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ancien mot de passe incorrect.",
        )

    if len(nouveau_mot_de_passe) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Le nouveau mot de passe doit contenir au moins 8 caractères.",
        )

    if ancien_mot_de_passe == nouveau_mot_de_passe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le nouveau mot de passe doit être différent de l'ancien.",
        )

    utilisateur.mot_de_passe_hash = hash_password(nouveau_mot_de_passe)
    db.commit()


def re_uploader_documents(
    db: Session,
    utilisateur: Utilisateur,
    cni_recto: UploadFile | None = None,
    cni_verso: UploadFile | None = None,
    photo_identite: UploadFile | None = None,
    document_entreprise: UploadFile | None = None,
) -> Utilisateur:
    """
    Re-soumet un ou plusieurs documents pour re-validation.
    Repasse automatiquement le statut à 'en_attente'.
    """
    if cni_recto is None and cni_verso is None and photo_identite is None and document_entreprise is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Au moins un document doit être fourni.",
        )

    if document_entreprise is not None:
        if utilisateur.type_compte != "entreprise":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Le document entreprise ne s'applique qu'aux comptes entreprise.",
            )
        utilisateur.document_entreprise_url = _sauvegarder_document(document_entreprise)

    if cni_recto is not None:
        utilisateur.cni_recto_url = _sauvegarder_document(cni_recto)
    if cni_verso is not None:
        utilisateur.cni_verso_url = _sauvegarder_document(cni_verso)
    if photo_identite is not None:
        utilisateur.photo_identite_url = _sauvegarder_document(photo_identite)

    utilisateur.document_statut = "en_attente"
    utilisateur.document_date_upload = datetime.now(timezone.utc)

    db.commit()
    db.refresh(utilisateur)
    return utilisateur
