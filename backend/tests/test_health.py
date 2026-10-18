import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["dataset_loaded"] is True
    assert data["total_records"] == 123117
    assert data["duckdb_active"] is True

def test_overview_metrics():
    response = client.get("/api/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["total_records"] == 123117
    assert data["attack_labels_count"] == 12
    assert data["normal_traffic_count"] == 12507
    assert round(data["normal_traffic_percentage"], 2) == 10.16
    assert data["majority_attack_label"] == "DOS_SYN_Hping"
    assert data["rf_macro_f1"] is not None
    assert data["rf_macro_f1"] > 0.90
