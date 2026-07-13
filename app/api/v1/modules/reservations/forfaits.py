"""
Grille tarifaire de référence — HR Coworking.

La gamme n'est pas une propriété du bureau : c'est un choix du client au
moment de la réservation. Le prix ne dépend que du couple (gamme, forfait)
choisi — ce n'est jamais une multiplication durée × tarif.

Pour le moment, seule la gamme standard est disponible (4 forfaits : heure,
jour, semaine, mois). La gamme VIP sera réintroduite plus tard.
"""

from datetime import datetime, timedelta

DUREE_PAR_FORFAIT = {
    "heure": timedelta(hours=1),
    "jour": timedelta(days=1),
    "semaine": timedelta(days=7),
    "mois": timedelta(days=30),
}

FORFAITS = {
    ("standard", "heure"): {
        "prix": 1000,
        "prestations": ["WiFi", "Bureau 1 place"],
    },
    ("standard", "jour"): {
        "prix": 10000,
        "prestations": ["WiFi", "Bureau", "1 café"],
    },
    ("standard", "semaine"): {
        "prix": 40000,
        "prestations": ["WiFi", "Bureau", "2 chaises", "1 café"],
        "meilleure_valeur": True,
    },
    ("standard", "mois"): {
        "prix": 150000,
        "prestations": ["WiFi illimité", "Bureau", "2 chaises", "1 café", "1 thé"],
    },
}


def obtenir_forfait(gamme: str, forfait: str) -> dict:
    return FORFAITS[(gamme, forfait)]


def calculer_date_fin(date_debut: datetime, forfait: str) -> datetime:
    return date_debut + DUREE_PAR_FORFAIT[forfait]


def lister_forfaits() -> list[dict]:
    """Aplati FORFAITS en liste, pour l'API (GET /reservations/forfaits)."""
    return [
        {
            "gamme": gamme,
            "forfait": forfait,
            "prix": donnees["prix"],
            "prestations": donnees["prestations"],
            "meilleure_valeur": donnees.get("meilleure_valeur", False),
        }
        for (gamme, forfait), donnees in FORFAITS.items()
    ]
