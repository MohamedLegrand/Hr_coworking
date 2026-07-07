"""
Logique métier du module espaces : consultation publique et
administration du catalogue de bureaux.
"""

from decimal import Decimal

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.v1.modules.espaces.modeles import Espace
from app.noyau.configuration import settings
from app.noyau.utilitaires_fichiers import sauvegarder_fichier

EXTENSIONS_IMAGES_AUTORISEES = {".jpg", ".jpeg", ".png", ".webp"}


def _sauvegarder_image(image: UploadFile) -> str:
    return sauvegarder_fichier(
        image, settings.UPLOAD_IMAGES_DIR, EXTENSIONS_IMAGES_AUTORISEES
    )


def lister_espaces_disponibles(
    db: Session,
    type_espace: str | None = None,
    capacite_min: int | None = None,
    prix_max: Decimal | None = None,
) -> list[Espace]:
    requete = db.query(Espace).filter(Espace.est_disponible == True)  # noqa: E712

    if type_espace:
        requete = requete.filter(Espace.type_espace == type_espace)
    if capacite_min is not None:
        requete = requete.filter(Espace.capacite >= capacite_min)
    if prix_max is not None:
        requete = requete.filter(Espace.prix_jour <= prix_max)

    return requete.order_by(Espace.nom).all()


def lister_tous_les_espaces(db: Session) -> list[Espace]:
    return db.query(Espace).order_by(Espace.nom).all()


def obtenir_espace(db: Session, espace_id: str) -> Espace:
    espace = db.query(Espace).filter(Espace.id == espace_id).first()
    if not espace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Espace introuvable.",
        )
    return espace


def creer_espace(
    db: Session,
    nom: str,
    type_espace: str,
    capacite: int,
    prix_heure: Decimal | None,
    prix_jour: Decimal | None,
    description: str | None,
    localisation: str | None,
    image: UploadFile | None,
) -> Espace:
    image_url = _sauvegarder_image(image) if image else None

    nouvel_espace = Espace(
        nom=nom, type_espace=type_espace, capacite=capacite,
        prix_heure=prix_heure, prix_jour=prix_jour, description=description,
        localisation=localisation, image_url=image_url, est_disponible=True,
    )

    db.add(nouvel_espace)
    db.commit()
    db.refresh(nouvel_espace)
    return nouvel_espace


def supprimer_espace(db: Session, espace_id: str) -> None:
    from app.api.v1.modules.reservations.modeles import Reservation, ReservationDetail

    espace = obtenir_espace(db, espace_id)

    reservation_active = (
        db.query(ReservationDetail)
        .join(Reservation)
        .filter(
            ReservationDetail.espace_id == espace_id,
            Reservation.statut.in_(["en_attente", "confirmee"]),
        )
        .first()
    )
    if reservation_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Impossible de supprimer un espace ayant des réservations actives.",
        )

    db.delete(espace)
    db.commit()


def modifier_espace(
    db: Session,
    espace_id: str,
    nom: str | None = None,
    type_espace: str | None = None,
    capacite: int | None = None,
    prix_heure: Decimal | None = None,
    prix_jour: Decimal | None = None,
    description: str | None = None,
    localisation: str | None = None,
    est_disponible: bool | None = None,
    image: UploadFile | None = None,
) -> Espace:
    espace = obtenir_espace(db, espace_id)

    if nom is not None:
        espace.nom = nom
    if type_espace is not None:
        espace.type_espace = type_espace
    if capacite is not None:
        espace.capacite = capacite
    if prix_heure is not None:
        espace.prix_heure = prix_heure
    if prix_jour is not None:
        espace.prix_jour = prix_jour
    if description is not None:
        espace.description = description
    if localisation is not None:
        espace.localisation = localisation
    if est_disponible is not None:
        espace.est_disponible = est_disponible
    if image is not None:
        espace.image_url = _sauvegarder_image(image)

    db.commit()
    db.refresh(espace)
    return espace
