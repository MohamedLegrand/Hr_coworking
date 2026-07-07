"""
Fixtures partagées par tous les tests (ex: client de test FastAPI,
session de base de données de test).
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)
