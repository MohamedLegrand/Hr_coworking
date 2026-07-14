"""
Endpoints du module espaces.
"""

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from sqlalchemy.orm import Session

from app.api.v1.modules.espaces import service
from app.api.v1.modules.espaces.schemas import EspaceReponse, TypeEspace
from app.noyau.base_donnees import get_db
from app.noyau.dependances import get_administrateur_courant

router = APIRouter()


@router.get("/", response_model=list[EspaceReponse])
def lister_espaces(
    type_espace: TypeEspace | None = Query(None),
    capacite_min: int | None = Query(None, ge=1),
    db: Session = Depends(get_db),
):
    return service.lister_espaces_disponibles(
        db, type_espace=type_espace.value if type_espace else None,
        capacite_min=capacite_min,
    )


@router.get("/admin/tous", response_model=list[EspaceReponse])
def lister_tous_les_espaces(
    db: Session = Depends(get_db),
    _admin=Depends(get_administrateur_courant),
):
    return service.lister_tous_les_espaces(db)


@router.get("/{espace_id}", response_model=EspaceReponse)
def obtenir_espace(espace_id: str, db: Session = Depends(get_db)):
    return service.obtenir_espace(db, espace_id)


@router.post("/", response_model=EspaceReponse, status_code=201)
def creer_espace(
    nom: str = Form(...),
    type_espace: TypeEspace = Form(...),
    capacite: int = Form(...),
    description: str | None = Form(None),
    localisation: str | None = Form(None),
    visible_plan_3d: bool = Form(True),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    _admin=Depends(get_administrateur_courant),
):
    return service.creer_espace(
        db, nom=nom, type_espace=type_espace.value, capacite=capacite,
        description=description, localisation=localisation,
        visible_plan_3d=visible_plan_3d, image=image,
    )


@router.delete("/{espace_id}", status_code=204)
def supprimer_espace(
    espace_id: str,
    db: Session = Depends(get_db),
    _admin=Depends(get_administrateur_courant),
):
    """
    Supprime définitivement un espace.
    Bloqué si l'espace a des réservations en_attente ou confirmees.
    """
    service.supprimer_espace(db, espace_id)


@router.patch("/{espace_id}", response_model=EspaceReponse)
def modifier_espace(
    espace_id: str,
    nom: str | None = Form(None),
    type_espace: TypeEspace | None = Form(None),
    capacite: int | None = Form(None),
    description: str | None = Form(None),
    localisation: str | None = Form(None),
    est_disponible: bool | None = Form(None),
    visible_plan_3d: bool | None = Form(None),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    _admin=Depends(get_administrateur_courant),
):
    return service.modifier_espace(
        db, espace_id, nom=nom,
        type_espace=type_espace.value if type_espace else None,
        capacite=capacite, description=description, localisation=localisation,
        est_disponible=est_disponible, visible_plan_3d=visible_plan_3d, image=image,
    )
