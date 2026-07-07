from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.noyau.configuration import settings

app = FastAPI(title=settings.APP_NAME, description="API de réservation d'espaces de coworking", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", tags=["Santé"])
def health_check():
    return {"status": "ok", "message": f"{settings.APP_NAME} est opérationnelle"}

# ------------------------------------------------------------------
# Routeurs des modules métier, préfixés par /api/v1
# ------------------------------------------------------------------
from app.api.v1.modules.authentification.routeur import router as auth_router
from app.api.v1.modules.espaces.routeur import router as espaces_router
from app.api.v1.modules.reservations.routeur import router as reservations_router
from app.api.v1.modules.paiements.routeur import router as paiements_router
from app.api.v1.modules.notifications.routeur import router as notifications_router
from app.api.v1.modules.administration.routeur import router as administration_router
from app.api.v1.modules.utilisateurs.routeur import router as utilisateurs_router

app.include_router(auth_router, prefix="/api/v1/authentification", tags=["Authentification"])
app.include_router(espaces_router, prefix="/api/v1/espaces", tags=["Espaces"])
app.include_router(reservations_router, prefix="/api/v1/reservations", tags=["Reservations"])
app.include_router(paiements_router, prefix="/api/v1/paiements", tags=["Paiements"])
app.include_router(notifications_router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(administration_router, prefix="/api/v1/administration", tags=["Administration"])
app.include_router(utilisateurs_router, prefix="/api/v1/utilisateurs", tags=["Utilisateurs"])
