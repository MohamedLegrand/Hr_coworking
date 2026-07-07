"""
Utilitaire partagé pour sauvegarder un fichier uploadé sur le disque.
Utilisé par authentification (CNI, documents entreprise) et espaces
(images de bureaux), pour éviter de dupliquer cette logique.
"""

import os
import uuid

from fastapi import HTTPException, UploadFile, status


def sauvegarder_fichier(
    fichier: UploadFile,
    dossier: str,
    extensions_autorisees: set[str],
    taille_max_octets: int = 5 * 1024 * 1024,
) -> str:
    extension = os.path.splitext(fichier.filename or "")[1].lower()
    if extension not in extensions_autorisees:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Format de fichier non autorisé : {extension or 'inconnu'}. "
                f"Formats acceptés : {', '.join(sorted(extensions_autorisees))}"
            ),
        )

    contenu = fichier.file.read()
    if len(contenu) > taille_max_octets:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Le fichier dépasse la taille maximale autorisée "
            f"({taille_max_octets // (1024 * 1024)} Mo).",
        )

    os.makedirs(dossier, exist_ok=True)
    nom_fichier = f"{uuid.uuid4().hex}{extension}"
    chemin_complet = os.path.join(dossier, nom_fichier)

    with open(chemin_complet, "wb") as destination:
        destination.write(contenu)

    return chemin_complet.replace("\\", "/")
