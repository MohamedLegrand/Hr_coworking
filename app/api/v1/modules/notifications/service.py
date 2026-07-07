"""
Logique métier du module notifications.

Ce module est déclenché par d'autres modules (paiements, reservations,
authentification), pas directement par l'utilisateur.

Pour le MVP, l'envoi d'email est simulé (affiché dans les logs).
TODO (production) : remplacer _envoyer_email() par un vrai envoi
via SendGrid, Mailjet, ou tout autre fournisseur SMTP.
"""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.modules.notifications.modeles import Notification


def _envoyer_email(destinataire: str, sujet: str, contenu: str) -> None:
    """
    Placeholder d'envoi d'email — affiche dans les logs pour le MVP.

    TODO (production) :
        import sendgrid  # ou smtplib, mailjet_rest, etc.
        # Envoyer un vrai email au destinataire
    """
    print(
        f"[EMAIL] À : {destinataire} | "
        f"Sujet : {sujet} | "
        f"Contenu : {contenu[:80]}..."
    )


def creer_notification(
    db: Session,
    utilisateur_id: str,
    type_notification: str,
    contenu: str,
    email_destinataire: str | None = None,
    sujet_email: str | None = None,
) -> Notification:
    """
    Crée une notification en base ET envoie un email si les infos
    de destinataire sont fournies.
    """
    nouvelle_notification = Notification(
        utilisateur_id=utilisateur_id,
        type=type_notification,
        contenu=contenu,
        est_lu=False,
    )
    db.add(nouvelle_notification)
    db.commit()
    db.refresh(nouvelle_notification)

    if email_destinataire and sujet_email:
        _envoyer_email(email_destinataire, sujet_email, contenu)

    return nouvelle_notification


def notifier_confirmation_reservation(
    db: Session,
    utilisateur_id: str,
    email_utilisateur: str,
    reservation_id: str,
    prix_total: str,
) -> None:
    """Appelé par le module paiements après un webhook SUCCESS."""
    contenu = (
        f"Votre réservation #{str(reservation_id)[:8].upper()} a été confirmée. "
        f"Montant payé : {prix_total} XAF. "
        f"Merci de votre confiance — HR Coworking."
    )
    creer_notification(
        db,
        utilisateur_id=utilisateur_id,
        type_notification="confirmation",
        contenu=contenu,
        email_destinataire=email_utilisateur,
        sujet_email="✅ Réservation confirmée — HR Coworking",
    )


def notifier_annulation_reservation(
    db: Session,
    utilisateur_id: str,
    email_utilisateur: str,
    reservation_id: str,
) -> None:
    """Appelé par le module reservations lors d'une annulation."""
    contenu = (
        f"Votre réservation #{str(reservation_id)[:8].upper()} a été annulée. "
        f"Si vous avez une question, contactez notre équipe."
    )
    creer_notification(
        db,
        utilisateur_id=utilisateur_id,
        type_notification="annulation",
        contenu=contenu,
        email_destinataire=email_utilisateur,
        sujet_email="❌ Réservation annulée — HR Coworking",
    )


def notifier_reinitialisation_mot_de_passe(
    db: Session,
    utilisateur_id: str,
    email_utilisateur: str,
    lien_reset: str,
) -> None:
    """
    Appelé par le module authentification (mot de passe oublié).
    Remplace le placeholder print() dans authentification/service.py.
    """
    contenu = (
        f"Vous avez demandé une réinitialisation de mot de passe. "
        f"Cliquez sur ce lien (valide 15 min) : {lien_reset}"
    )
    creer_notification(
        db,
        utilisateur_id=utilisateur_id,
        type_notification="rappel",
        contenu=contenu,
        email_destinataire=email_utilisateur,
        sujet_email="🔐 Réinitialisation de mot de passe — HR Coworking",
    )


def lister_mes_notifications(
    db: Session,
    utilisateur_id: str,
    non_lues_seulement: bool = False,
) -> list[Notification]:
    requete = db.query(Notification).filter(
        Notification.utilisateur_id == utilisateur_id
    )
    if non_lues_seulement:
        requete = requete.filter(Notification.est_lu == False)  # noqa: E712
    return requete.order_by(Notification.date_envoi.desc()).all()


def marquer_comme_lue(
    db: Session,
    notification_id: str,
    utilisateur_id: str,
) -> Notification:
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.utilisateur_id == utilisateur_id,
        )
        .first()
    )
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification introuvable.",
        )
    notification.est_lu = True
    db.commit()
    db.refresh(notification)
    return notification


def tout_marquer_comme_lu(db: Session, utilisateur_id: str) -> int:
    """Marque toutes les notifications non lues comme lues. Retourne le nombre mis à jour."""
    nombre = (
        db.query(Notification)
        .filter(
            Notification.utilisateur_id == utilisateur_id,
            Notification.est_lu == False,  # noqa: E712
        )
        .update({"est_lu": True})
    )
    db.commit()
    return nombre


def supprimer_notification(
    db: Session,
    notification_id: str,
    utilisateur_id: str,
) -> None:
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.utilisateur_id == utilisateur_id,
        )
        .first()
    )
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification introuvable.",
        )
    db.delete(notification)
    db.commit()


def supprimer_toutes_notifications(db: Session, utilisateur_id: str) -> int:
    """Supprime toutes les notifications de l'utilisateur. Retourne le nombre supprimé."""
    nombre = (
        db.query(Notification)
        .filter(Notification.utilisateur_id == utilisateur_id)
        .delete()
    )
    db.commit()
    return nombre
