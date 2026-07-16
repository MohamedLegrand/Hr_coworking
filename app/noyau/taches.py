"""
Tâche de fond : vérification périodique des paiements en attente.

Remplace le webhook HR-Skills Pay. Toutes les N secondes, on interroge
l'API pour les paiements encore PENDING et on met à jour leur statut.

Pourquoi une tâche serveur plutôt qu'un simple polling frontend :
le client peut fermer son navigateur juste après avoir validé sur son
téléphone. Sans tâche serveur, sa réservation resterait bloquée en
"en_attente" alors qu'il a bel et bien payé.
"""

import asyncio
import logging
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)

# Intervalle entre deux passages de vérification
INTERVALLE_SECONDES = 20

# Au-delà de cette ancienneté, on cesse de vérifier un paiement.
# HR-Skills Pay bascule lui-même en FAILED après 10 min sans confirmation ;
# on garde une marge pour récupérer ce statut final.
AGE_MAX_MINUTES = 15

_tache: asyncio.Task | None = None


def _verifier_paiements_en_attente() -> int:
    """
    Un passage de vérification (fonction 100% synchrone).
    Retourne le nombre de paiements dont le statut a changé.
    Ne lève jamais : toute erreur est journalisée.
    """
    from app.api.v1.modules.paiements.modeles import Paiement
    from app.api.v1.modules.paiements.service import traiter_webhook
    from app.noyau.base_donnees import SessionLocal
    from app.noyau.hrskillspay import client_partage

    db = SessionLocal()
    modifies = 0
    try:
        limite = datetime.now(timezone.utc) - timedelta(minutes=AGE_MAX_MINUTES)

        paiements = (
            db.query(Paiement)
            .filter(
                Paiement.statut == "PENDING",
                Paiement.cree_le >= limite,
                ~Paiement.reference.like("tmp_%"),  # jamais parti chez HR-Skills Pay
            )
            .all()
        )

        if not paiements:
            return 0

        logger.debug("Vérification de %d paiement(s) en attente", len(paiements))

        for paiement in paiements:
            try:
                transaction = client_partage().transactions.status(paiement.reference)
                donnees = transaction.model_dump()
                statut_distant = donnees.get("status")

                if statut_distant and statut_distant != paiement.statut:
                    # traiter_webhook est idempotent : il ignore un statut identique
                    traiter_webhook(db, "", donnees)
                    modifies += 1
                    logger.info(
                        "Paiement %s : PENDING → %s",
                        paiement.reference,
                        statut_distant,
                    )
            except Exception:
                # Un paiement en erreur ne doit pas bloquer les autres
                logger.exception(
                    "Échec de vérification du paiement %s", paiement.reference
                )

        return modifies
    finally:
        db.close()


async def _boucle_verification() -> None:
    """Boucle infinie : appelle la vérification à intervalle régulier."""
    logger.info(
        "Tâche de vérification des paiements démarrée (toutes les %ds)",
        INTERVALLE_SECONDES,
    )
    while True:
        try:
            # La vérification est synchrone (SQLAlchemy + SDK) : on la lance
            # dans un thread pour ne pas bloquer la boucle d'événements.
            modifies = await asyncio.to_thread(_verifier_paiements_en_attente)
            if modifies:
                logger.info("%d paiement(s) mis à jour", modifies)
        except asyncio.CancelledError:
            logger.info("Tâche de vérification arrêtée")
            raise
        except Exception:
            # La boucle ne doit JAMAIS mourir sur une erreur
            logger.exception("Erreur dans la boucle de vérification")

        await asyncio.sleep(INTERVALLE_SECONDES)


def demarrer_verification_paiements() -> None:
    """Démarre la tâche de fond (au démarrage de l'application)."""
    global _tache
    if _tache is None or _tache.done():
        _tache = asyncio.create_task(_boucle_verification())


async def arreter_verification_paiements() -> None:
    """Arrête proprement la tâche de fond (à l'extinction)."""
    global _tache
    if _tache and not _tache.done():
        _tache.cancel()
        try:
            await _tache
        except asyncio.CancelledError:
            pass
        _tache = None
