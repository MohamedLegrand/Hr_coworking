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

    Un simple print() de log ne doit jamais faire échouer la requête HTTP
    qui l'a déclenché (la notification est déjà enregistrée en base à ce
    stade) — certaines consoles (cp1252 sous Windows) ne savent pas encoder
    tous les emojis utilisés dans les sujets, d'où le garde-fou ci-dessous.
    """
    message = f"[EMAIL] À : {destinataire} | Sujet : {sujet} | Contenu : {contenu[:80]}..."
    try:
        print(message)
    except UnicodeEncodeError:
        print(message.encode("ascii", errors="replace").decode("ascii"))


def creer_notification(
    db: Session,
    utilisateur_id: str,
    type_notification: str,
    titre: str,
    contenu: str,
    email_destinataire: str | None = None,
    sujet_email: str | None = None,
) -> Notification:
    """
    Crée une notification en base ET envoie un email si les infos
    de destinataire sont fournies. Le titre seul est affiché dans les
    listes/menus déroulants ; le contenu complet n'apparaît que sur la
    page dédiée (GET /notifications/mes-notifications).
    """
    nouvelle_notification = Notification(
        utilisateur_id=utilisateur_id,
        type=type_notification,
        titre=titre,
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
        titre="✅ Réservation confirmée",
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
        titre="❌ Réservation annulée",
        contenu=contenu,
        email_destinataire=email_utilisateur,
        sujet_email="❌ Réservation annulée — HR Coworking",
    )


def notifier_validation_documents(
    db: Session,
    utilisateur_id: str,
    email_utilisateur: str,
    statut: str,
) -> None:
    """Appelé par le module administration après validation/refus des documents KYC."""
    if statut == "valide":
        titre = "✅ Documents validés"
        contenu = (
            "Vos documents d'identification ont été validés. "
            "Vous pouvez désormais finaliser le paiement de vos réservations."
        )
        type_notification = "document_valide"
        sujet_email = "✅ Documents validés — HR Coworking"
    else:
        titre = "❌ Documents refusés"
        contenu = (
            "Vos documents d'identification ont été refusés. "
            "Merci de les soumettre à nouveau depuis la page Paramètres de votre compte."
        )
        type_notification = "document_refuse"
        sujet_email = "❌ Documents refusés — HR Coworking"

    creer_notification(
        db,
        utilisateur_id=utilisateur_id,
        type_notification=type_notification,
        titre=titre,
        contenu=contenu,
        email_destinataire=email_utilisateur,
        sujet_email=sujet_email,
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
        titre="🔐 Réinitialisation de mot de passe",
        contenu=contenu,
        email_destinataire=email_utilisateur,
        sujet_email="🔐 Réinitialisation de mot de passe — HR Coworking",
    )


def notifier_creation_reservation(
    db: Session,
    utilisateur_id: str,
    email_utilisateur: str,
    reservation_id: str,
    gamme: str,
    forfait: str,
    nombre_bureaux: int,
    prix_total: str,
) -> None:
    """Appelé par le module reservations juste après la création (avant paiement)."""
    contenu = (
        f"Votre réservation #{str(reservation_id)[:8].upper()} a été enregistrée : "
        f"{nombre_bureaux} bureau{'x' if nombre_bureaux > 1 else ''}, "
        f"formule {gamme} — {forfait}. Montant total : {prix_total} XAF. "
        f"Elle reste en attente tant que le paiement n'est pas finalisé."
    )
    creer_notification(
        db,
        utilisateur_id=utilisateur_id,
        type_notification="reservation_creee",
        titre="🗓️ Réservation créée",
        contenu=contenu,
        email_destinataire=email_utilisateur,
        sujet_email="🗓️ Réservation créée — HR Coworking",
    )


def notifier_admins_creation_reservation(
    db: Session,
    reservation_id: str,
    noms_bureaux: list[str],
    date_debut,
    date_fin,
    client_nom: str,
    client_prenom: str,
) -> None:
    """
    Appelé par le module reservations juste après la création (avant paiement).
    Notifie tous les administrateurs qu'un bureau vient d'être réservé,
    en précisant la période concernée.
    """
    from app.api.v1.modules.authentification.modeles import Utilisateur

    periode = f"du {date_debut.strftime('%d/%m/%Y %H:%M')} au {date_fin.strftime('%d/%m/%Y %H:%M')}"
    bureaux = ", ".join(noms_bureaux)
    contenu = (
        f"{client_prenom} {client_nom} vient de réserver {bureaux} "
        f"({periode}). Réservation #{str(reservation_id)[:8].upper()} en attente de paiement."
    )

    admins = db.query(Utilisateur).filter(Utilisateur.role == "admin").all()
    for admin in admins:
        creer_notification(
            db,
            utilisateur_id=str(admin.id),
            type_notification="reservation_creee",
            titre="🗓️ Bureau réservé",
            contenu=contenu,
        )


def notifier_admins_paiement_recu(
    db: Session,
    reservation_id: str,
    gamme: str,
    forfait: str,
    nombre_bureaux: int,
    prix_total: str,
    operateur: str,
    numero_telephone: str | None,
    client_nom: str,
    client_prenom: str,
    client_email: str,
) -> None:
    """
    Appelé par le module paiements après un webhook SUCCESS.
    Notifie tous les administrateurs qu'un client vient de payer une réservation.
    """
    from app.api.v1.modules.authentification.modeles import Utilisateur

    contenu = (
        f"Le client {client_prenom} {client_nom} ({client_email}) vient d'effectuer "
        f"un paiement pour la réservation #{str(reservation_id)[:8].upper()} : "
        f"{nombre_bureaux} bureau{'x' if nombre_bureaux > 1 else ''}, "
        f"formule {gamme} — {forfait}. Montant : {prix_total} XAF. "
        f"Paiement via {operateur}"
        + (f" ({numero_telephone})." if numero_telephone else ".")
    )

    admins = db.query(Utilisateur).filter(Utilisateur.role == "admin").all()
    for admin in admins:
        creer_notification(
            db,
            utilisateur_id=str(admin.id),
            type_notification="paiement_recu",
            titre="💰 Nouveau paiement reçu",
            contenu=contenu,
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
