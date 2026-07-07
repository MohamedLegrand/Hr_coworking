"""
Endpoints du module utilisateurs.
"""

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.api.v1.modules.utilisateurs import service
from app.api.v1.modules.utilisateurs.schemas import (
    ChangementMotDePasse,
    MessageReponse,
    ProfilReponse,
)
from app.noyau.base_donnees import get_db
from app.noyau.dependances import get_utilisateur_courant

router = APIRouter()


@router.get("/profil", response_model=ProfilReponse)
def voir_profil(utilisateur=Depends(get_utilisateur_courant)):
    """
    Profil complet de l'utilisateur connecté, incluant URLs des documents
    et statut de validation. Plus détaillé que /authentification/moi.
    """
    return utilisateur


@router.patch("/profil", response_model=ProfilReponse)
def modifier_profil(
    nom: str | None = Form(None),
    prenom: str | None = Form(None),
    telephone: str | None = Form(None),
    nom_entreprise: str | None = Form(None),
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """
    Modifie les informations du profil.
    Seuls les champs fournis sont mis à jour.
    L'email et le type_compte ne sont pas modifiables.
    """
    return service.modifier_profil(
        db, utilisateur,
        nom=nom, prenom=prenom,
        telephone=telephone, nom_entreprise=nom_entreprise,
    )


@router.post("/changer-mot-de-passe", response_model=MessageReponse)
def changer_mot_de_passe(
    donnees: ChangementMotDePasse,
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """
    Change le mot de passe en vérifiant d'abord l'ancien.
    Différent de /authentification/reinitialiser-mot-de-passe
    qui est utilisé quand l'utilisateur a oublié son mot de passe.
    """
    service.changer_mot_de_passe(
        db, utilisateur,
        donnees.ancien_mot_de_passe,
        donnees.nouveau_mot_de_passe,
    )
    return MessageReponse(message="Mot de passe modifié avec succès.")


@router.post("/documents", response_model=ProfilReponse)
def re_uploader_documents(
    cni: UploadFile | None = File(None, description="Carte Nationale d'Identité"),
    document_entreprise: UploadFile | None = File(
        None, description="RCCM, statuts ou tout justificatif d'entreprise"
    ),
    db: Session = Depends(get_db),
    utilisateur=Depends(get_utilisateur_courant),
):
    """
    Re-soumet un ou plusieurs documents pour re-validation.
    Utilisé si un document a été refusé ou est expiré.
    Repasse automatiquement le statut à 'en_attente'.
    """
    return service.re_uploader_documents(
        db, utilisateur,
        cni=cni,
        document_entreprise=document_entreprise,
    )
