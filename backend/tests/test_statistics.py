import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_get_all_questions():
    response = client.get("/api/statistics/questions")
    assert response.status_code == 200
    data = response.json()
    assert data["total_questions"] == 15
    q_map = {q["question_id"]: q for q in data["questions"]}
    
    # Q1: Class Imbalance
    assert q_map["Q1"]["sample_size"] == 123117
    assert q_map["Q1"]["descriptive_statistics"]["majority_count"] == 94659
    
    # Q2: Protocol Chi-square
    assert round(q_map["Q2"]["test_statistic_value"], 2) == 83803.12 or round(q_map["Q2"]["test_statistic_value"], 1) == 83803.1
    assert round(q_map["Q2"]["effect_size_value"], 3) == 0.583
    
    # Q3: Service Chi-square
    assert round(q_map["Q3"]["test_statistic_value"], 1) == 301729.1
    assert round(q_map["Q3"]["effect_size_value"], 3) == 0.639
    
    # Q4: Kruskal-Wallis flow duration
    assert round(q_map["Q4"]["test_statistic_value"], 1) == 44749.5
    
    # Q5: Kruskal-Wallis total packets
    assert round(q_map["Q5"]["test_statistic_value"], 1) == 59302.9
    
    # Q6: Spearman rho fwd vs bwd pkts
    assert round(q_map["Q6"]["test_statistic_value"], 4) == 0.7463
    
    # Q7: Mann-Whitney U TCP vs UDP pkts/sec
    assert round(q_map["Q7"]["test_statistic_value"], 0) == 1207681478.0 or round(q_map["Q7"]["test_statistic_value"], 0) == 1207681479.0
    assert round(q_map["Q7"]["effect_size_value"], 4) == 0.7314
    
    # Q8: Mann-Whitney U TCP vs UDP payload rate
    assert round(q_map["Q8"]["test_statistic_value"], 0) == 1159424198.0 or round(q_map["Q8"]["test_statistic_value"], 0) == 1159424197.0
    assert round(q_map["Q8"]["effect_size_value"], 4) == 0.6622
    
    # Q9: Kruskal-Wallis SYN flag count
    assert round(q_map["Q9"]["test_statistic_value"], 1) == 57883.2
    
    # Q10: Two-proportion z test
    assert round(q_map["Q10"]["test_statistic_value"], 2) == -196.12
    assert q_map["Q10"]["confidence_interval"] == [-0.3771, -0.3658]
    
    # Q11: Spearman rho duration vs packet rate
    assert round(q_map["Q11"]["test_statistic_value"], 4) == -0.2959
    
    # Q13: Kruskal-Wallis down_up_ratio
    assert round(q_map["Q13"]["test_statistic_value"], 1) == 35188.4
    
    # Q14: Mann-Whitney U MQTT vs Non-MQTT duration
    assert round(q_map["Q14"]["test_statistic_value"], 0) == 488313532.0
    assert round(q_map["Q14"]["effect_size_value"], 4) == 0.9864

def test_correlations_matrix():
    response = client.get("/api/correlations")
    assert response.status_code == 200
    data = response.json()
    assert len(data["features"]) == 12
    assert len(data["matrix"]) == 12
    # Diagonal must be 1.0
    for i in range(12):
        assert data["matrix"][i][i] == 1.0

def test_hypotheses_endpoint():
    response = client.get("/api/hypotheses")
    assert response.status_code == 200
    data = response.json()
    assert data["total_tests"] == 11 or data["total_tests"] == 12
    assert data["significant_raw_count"] >= 10
    assert data["significant_bh_count"] >= 10
