"""
Endpoints du module administration.
Tous protégés par get_administrateur_courant.
"""

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.v1.modules.administration import service
from app.api.v1.modules.administration.schemas import (
    MessageReponse,
    StatistiquesReponse,
    StatutDocument,
    TypeCompte,
    UtilisateurAdminReponse,
    ValidationDocumentEntree,
)
from app.noyau.base_donnees import get_db
from app.noyau.dependances import get_administrateur_courant

router = APIRouter()


@router.get("/utilisateurs", response_model=list[UtilisateurAdminReponse])
def lister_utilisateurs(
    type_compte: TypeCompte | None = Query(None),
    document_statut: StatutDocument | None = Query(None),
    est_actif: bool | None = Query(None),
    db: Session = Depends(get_db),
    _admin=Depends(get_administrateur_courant),
):
    """
    Liste tous les utilisateurs avec filtres optionnels :
    type_compte, document_statut, est_actif.
    """
    return service.lister_utilisateurs(
        db,
        type_compte=type_compte.value if type_compte else None,
        document_statut=document_statut.value if document_statut else None,
        est_actif=est_actif,
    )


@router.patch(
    "/utilisateurs/{utilisateur_id}/valider-document",
    response_model=UtilisateurAdminReponse,
)
def valider_document(
    utilisateur_id: uuid.UUID,
    donnees: ValidationDocumentEntree,
    db: Session = Depends(get_db),
    _admin=Depends(get_administrateur_courant),
):
    """Valide ou invalide le document d'un utilisateur (soft KYB)."""
    return service.valider_document(
        db, str(utilisateur_id), donnees.statut.value
    )


@router.patch(
    "/utilisateurs/{utilisateur_id}/desactiver",
    response_model=UtilisateurAdminReponse,
)
def desactiver_utilisateur(
    utilisateur_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin=Depends(get_administrateur_courant),
):
    """Désactive un compte. Le compte ne peut plus se connecter ni réserver."""
    return service.desactiver_utilisateur(db, str(utilisateur_id))


@router.patch(
    "/utilisateurs/{utilisateur_id}/reactiver",
    response_model=UtilisateurAdminReponse,
)
def reactiver_utilisateur(
    utilisateur_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin=Depends(get_administrateur_courant),
):
    """Réactive un compte préalablement désactivé."""
    return service.reactiver_utilisateur(db, str(utilisateur_id))


@router.get("/statistiques", response_model=StatistiquesReponse)
def statistiques(
    db: Session = Depends(get_db),
    _admin=Depends(get_administrateur_courant),
):
    """
    Tableau de bord admin : indicateurs clés sur les utilisateurs,
    espaces, réservations et revenus.
    """
    return service.obtenir_statistiques(db)
