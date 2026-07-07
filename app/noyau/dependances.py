"""
Dépendances FastAPI partagées par plusieurs modules.
Ex: récupérer l'utilisateur actuellement connecté à partir du token JWT.
"""

import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.api.v1.modules.authentification.modeles import Utilisateur
from app.noyau.base_donnees import get_db
from app.noyau.securite import decoder_access_token

# Indique à FastAPI où se trouve l'endpoint de connexion (utilisé par /docs)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/authentification/connexion")


def get_utilisateur_courant(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Utilisateur:
    """Décode le token JWT et retourne l'objet Utilisateur correspondant."""
    identifiants_invalides = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Identifiants invalides ou expirés",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decoder_access_token(token)
        utilisateur_id: str = payload.get("sub")
        if utilisateur_id is None:
            raise identifiants_invalides
    except Exception:
        raise identifiants_invalides

    utilisateur = (
        db.query(Utilisateur)
        .filter(Utilisateur.id == uuid.UUID(utilisateur_id))
        .first()
    )
    if utilisateur is None or not utilisateur.est_actif:
        raise identifiants_invalides

    return utilisateur


def get_administrateur_courant(
    utilisateur: Utilisateur = Depends(get_utilisateur_courant),
) -> Utilisateur:
    """Vérifie que l'utilisateur connecté a le rôle admin."""
    if utilisateur.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs.",
        )
    return utilisateur
