"""
Endpoints du module authentification.
"""

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.v1.modules.authentification import service
from app.api.v1.modules.authentification.modeles import Utilisateur
from app.api.v1.modules.authentification.schemas import (
    DemandeMotDePasseOublie,
    MessageReponse,
    ReinitialisationMotDePasse,
    Token,
    TypeCompte,
    UtilisateurReponse,
)
from app.noyau.base_donnees import get_db
from app.noyau.dependances import get_utilisateur_courant
from app.noyau.securite import creer_access_token

router = APIRouter()


@router.post("/inscription", response_model=UtilisateurReponse, status_code=201)
def inscription(
    email: str = Form(...),
    mot_de_passe: str = Form(...),
    nom: str = Form(...),
    prenom: str = Form(...),
    type_compte: TypeCompte = Form(...),
    telephone: str | None = Form(None),
    nom_entreprise: str | None = Form(None),
    cni: UploadFile = File(..., description="Carte Nationale d'Identité"),
    document_entreprise: UploadFile | None = File(
        None, description="RCCM, statuts ou tout justificatif d'entreprise"
    ),
    db: Session = Depends(get_db),
):
    """Inscription d'un freelance ou d'une entreprise, documents inclus."""
    return service.creer_utilisateur(
        db=db,
        email=email,
        mot_de_passe=mot_de_passe,
        nom=nom,
        prenom=prenom,
        type_compte=type_compte.value,
        telephone=telephone,
        nom_entreprise=nom_entreprise,
        cni=cni,
        document_entreprise=document_entreprise,
    )


@router.post("/connexion", response_model=Token)
def connexion(
    identifiants: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Connexion : retourne un token JWT (le champ username = l'email)."""
    utilisateur = service.authentifier_utilisateur(
        db, identifiants.username, identifiants.password
    )
    access_token = creer_access_token(data={"sub": str(utilisateur.id)})
    return Token(access_token=access_token)


@router.get("/moi", response_model=UtilisateurReponse)
def moi(utilisateur: Utilisateur = Depends(get_utilisateur_courant)):
    """Retourne les informations de l'utilisateur actuellement connecté."""
    return utilisateur


@router.post("/mot-de-passe-oublie", response_model=MessageReponse)
def mot_de_passe_oublie(
    demande: DemandeMotDePasseOublie,
    db: Session = Depends(get_db),
):
    """
    Déclenche l'envoi d'un lien de réinitialisation. Retourne toujours le
    même message, que l'email existe ou non (sécurité).
    """
    service.demander_reinitialisation_mot_de_passe(db, demande.email)
    return MessageReponse(
        message="Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."
    )


@router.post("/reinitialiser-mot-de-passe", response_model=MessageReponse)
def reinitialiser_mot_de_passe(
    donnees: ReinitialisationMotDePasse,
    db: Session = Depends(get_db),
):
    """Confirme la réinitialisation avec le token reçu et le nouveau mot de passe."""
    service.reinitialiser_mot_de_passe(db, donnees.token, donnees.nouveau_mot_de_passe)
    return MessageReponse(message="Mot de passe réinitialisé avec succès.")
