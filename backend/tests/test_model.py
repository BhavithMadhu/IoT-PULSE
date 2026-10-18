import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_model_metrics():
    response = client.get("/api/model/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "model_metrics" in data
    assert len(data["model_metrics"]) == 2
    
    rf = next(m for m in data["model_metrics"] if m["model"] == "Random Forest")
    dummy = next(m for m in data["model_metrics"] if m["model"] == "Majority-class baseline")
    
    # RF should dramatically outperform baseline on balanced metrics
    assert rf["macro_F1"] > 0.90
    assert rf["balanced_accuracy"] > 0.90
    assert dummy["macro_F1"] < 0.15
    assert dummy["balanced_accuracy"] < 0.15
    
    # Check confusion matrix
    cm = data["confusion_matrix"]
    assert len(cm["labels"]) == 12
    assert len(cm["matrix_normalized"]) == 12
    
    # Check top feature importance
    feat_imp = data["top_feature_importance"]
    assert len(feat_imp) > 0
    assert feat_imp[0]["importance"] > 0.0

def test_confusion_matrix_endpoint():
    response = client.get("/api/model/confusion-matrix")
    assert response.status_code == 200
    data = response.json()
    assert len(data["labels"]) == 12

def test_feature_importance_endpoint():
    response = client.get("/api/model/feature-importance")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
