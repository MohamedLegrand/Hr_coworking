"""
Endpoints du module authentification.
"""

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.v1.modules.authentification import service
from app.api.v1.modules.authentification.modeles import Utilisateur
from app.api.v1.modules.authentification.schemas import (
    DemandeMotDePasseOublie,
    InscriptionEntree,
    MessageReponse,
    ReinitialisationMotDePasse,
    Token,
    UtilisateurReponse,
)
from app.noyau.base_donnees import get_db
from app.noyau.dependances import get_utilisateur_courant
from app.noyau.securite import creer_access_token

router = APIRouter()


@router.post("/inscription", response_model=UtilisateurReponse, status_code=201)
def inscription(
    donnees: InscriptionEntree,
    db: Session = Depends(get_db),
):
    """
    Inscription d'un freelance ou d'une entreprise.
    Les documents KYC (CNI recto/verso, photo d'identité, justificatif
    d'entreprise) et l'acceptation des conditions d'utilisation sont demandés
    plus tard, réservation par réservation, via
    POST /reservations/{id}/valider-cgu-kyc.
    """
    return service.creer_utilisateur(
        db=db,
        email=donnees.email,
        mot_de_passe=donnees.mot_de_passe,
        nom=donnees.nom,
        prenom=donnees.prenom,
        type_compte=donnees.type_compte.value,
        telephone=donnees.telephone,
        nom_entreprise=donnees.nom_entreprise,
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
