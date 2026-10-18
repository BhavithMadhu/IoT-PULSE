import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_list_tables():
    response = client.get("/api/export/tables")
    assert response.status_code == 200
    data = response.json()
    assert "allowed_tables" in data
    assert "AttackDistribution" in data["allowed_tables"]
    assert "HypothesisTestResults" in data["allowed_tables"]
    assert "ModelMetrics" in data["allowed_tables"]

def test_download_table():
    response = client.get("/api/export/AttackDistribution")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    lines = response.text.strip().split("\n")
    assert len(lines) == 13 # header + 12 attack labels
    assert "DOS_SYN_Hping" in response.text

def test_invalid_table_download():
    response = client.get("/api/export/arbitrary_table")
    assert response.status_code == 400
