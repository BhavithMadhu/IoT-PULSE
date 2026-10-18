import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_explorer_default_pagination():
    response = client.get("/api/flows?page=1&page_size=20")
    assert response.status_code == 200
    data = response.json()
    assert data["total_records"] == 123117
    assert data["filtered_records"] == 123117
    assert len(data["records"]) == 20
    assert data["page"] == 1
    assert data["page_size"] == 20
    assert data["total_pages"] == 6156

def test_explorer_attack_filtering():
    response = client.get("/api/flows?attack_type=MQTT_Publish&page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["filtered_records"] == 4146
    assert len(data["records"]) == 10
    for r in data["records"]:
        assert r["Attack_type"] == "MQTT_Publish"

def test_explorer_protocol_filtering():
    response = client.get("/api/flows?proto=udp&page=1&page_size=15")
    assert response.status_code == 200
    data = response.json()
    assert data["filtered_records"] == 12633
    assert len(data["records"]) == 15
    for r in data["records"]:
        assert r["proto"].lower() == "udp"

def test_explorer_service_filtering():
    response = client.get("/api/flows?service=mqtt&page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["filtered_records"] == 4132

def test_explorer_sorting():
    response = client.get("/api/flows?sort_by=flow_duration&sort_order=desc&page=1&page_size=5")
    assert response.status_code == 200
    data = response.json()
    durations = [r["flow_duration"] for r in data["records"]]
    # Descending order check
    assert durations[0] >= durations[1] >= durations[2]

def test_explorer_invalid_sort():
    response = client.get("/api/flows?sort_order=invalid")
    assert response.status_code == 422
