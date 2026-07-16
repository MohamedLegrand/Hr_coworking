"""
Intégration du SDK officiel HR-Skills Pay (hrpay).

Le SDK gère lui-même le transaction token (cache + renouvellement
automatique), les retries, le circuit breaker et le typage des réponses.
Ce module n'expose qu'une instance partagée et un utilitaire de formatage.
"""

from hrpay import FileTokenCache, HRPayClient

_client: HRPayClient | None = None


def client_partage() -> HRPayClient:
    """
    Retourne l'instance partagée du client HR-Skills Pay.

    Le client est créé à la première utilisation (lazy) pour que la
    configuration soit déjà chargée au moment de sa construction.

    Le transaction token est mis en cache dans un fichier plutôt qu'en
    mémoire : tous les workers uvicorn le partagent et il survit aux
    redémarrages, ce qui évite un appel /auth/transaction-token par worker.
    """
    global _client
    if _client is None:
        from app.noyau.configuration import settings

        _client = HRPayClient(
            settings.HR_SKILLS_PAY_CLE_A,
            settings.HR_SKILLS_PAY_CLE_B,
            base_url=settings.HR_SKILLS_PAY_BASE_URL,
            max_retries=3,
            token_cache=FileTokenCache(settings.HR_SKILLS_PAY_TOKEN_CACHE),
        )
    return _client


def formater_numero_cameroun(numero: str) -> str:
    """
    Normalise un numéro de téléphone au format attendu par HR-Skills Pay :
    indicatif pays sans le '+'.

    Accepte : '655500393', '+237655500393', '237655500393', '6 55 50 03 93'
    Retourne : '237655500393'
    """
    nettoye = "".join(c for c in numero if c.isdigit())
    if nettoye.startswith("237"):
        return nettoye
    if len(nettoye) == 9:
        return f"237{nettoye}"
    return nettoye
