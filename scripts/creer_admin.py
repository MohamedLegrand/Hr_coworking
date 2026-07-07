"""
Script de création du compte administrateur.
À exécuter une seule fois depuis la racine du projet :
    python scripts/creer_admin.py
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.noyau.configuration import settings
from app.noyau.base_donnees import SessionLocal
from app.noyau.securite import hash_password
from app.api.v1.modules.authentification.modeles import Utilisateur


def creer_admin():
    db = SessionLocal()
    try:
        email = "johann@gmail.com"

        # Vérifier que l'admin n'existe pas déjà
        existant = db.query(Utilisateur).filter(
            Utilisateur.email == email
        ).first()

        if existant:
            print(f"Un compte avec l'email {email} existe déjà.")
            return

        admin = Utilisateur(
            email=email,
            mot_de_passe_hash=hash_password("Joh@nn00securex9"),
            nom="Liebert",
            prenom="Johann",
            type_compte="freelance",
            role="admin",
            cni_url="",
            document_statut="valide",
            est_actif=True,
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"Administrateur créé avec succès : {admin.prenom} {admin.nom} ({admin.email})")
        print(f"ID : {admin.id}")

    except Exception as e:
        db.rollback()
        print(f"Erreur : {e}")
    finally:
        db.close()


if __name__ == "__main__":
    creer_admin()
