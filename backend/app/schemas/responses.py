from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str
    dataset_loaded: bool
    total_records: int
    columns_count: int
    duckdb_active: bool

class OverviewResponse(BaseModel):
    total_records: int
    attack_labels_count: int
    normal_traffic_count: int
    normal_traffic_percentage: float
    malicious_traffic_count: int
    malicious_traffic_percentage: float
    majority_attack_label: str
    majority_attack_percentage: float
    least_represented_label: str
    least_represented_percentage: float
    numeric_features_count: int
    categorical_features_count: int
    rf_macro_f1: Optional[float] = None
    rf_balanced_accuracy: Optional[float] = None
    rf_accuracy: Optional[float] = None
    baseline_macro_f1: Optional[float] = None

class AttackDistributionItem(BaseModel):
    attack_type: str
    record_count: int
    percentage: float
    is_normal: bool

class AttackDistributionResponse(BaseModel):
    total_records: int
    distribution: List[AttackDistributionItem]

class ProtocolDistributionItem(BaseModel):
    proto: str
    record_count: int
    percentage: float

class ProtocolDistributionResponse(BaseModel):
    total_records: int
    distribution: List[ProtocolDistributionItem]

class ServiceDistributionItem(BaseModel):
    service: str
    record_count: int
    percentage: float

class ServiceDistributionResponse(BaseModel):
    total_records: int
    distribution: List[ServiceDistributionItem]

class FeatureSummaryItem(BaseModel):
    feature: str
    dtype: str
    count: int
    mean: Optional[float] = None
    std: Optional[float] = None
    min: Optional[float] = None
    q25: Optional[float] = None
    median: Optional[float] = None
    q75: Optional[float] = None
    max: Optional[float] = None
    iqr: Optional[float] = None
    outlier_count: Optional[int] = None
    outlier_percentage: Optional[float] = None

class FeatureSummaryResponse(BaseModel):
    total_features: int
    features: List[FeatureSummaryItem]

class CorrelationResponse(BaseModel):
    features: List[str]
    matrix: List[List[float]]

class QuestionDetail(BaseModel):
    question_id: str
    title: str
    purpose_and_relevance: str
    relevant_variables: List[str]
    analytical_method: str
    null_hypothesis: Optional[str] = None
    alternative_hypothesis: Optional[str] = None
    sample_size: int
    descriptive_statistics: Dict[str, Any]
    test_statistic_name: Optional[str] = None
    test_statistic_value: Optional[float] = None
    p_value: Optional[float] = None
    p_value_formatted: Optional[str] = None
    effect_size_name: Optional[str] = None
    effect_size_value: Optional[float] = None
    confidence_interval: Optional[List[float]] = None
    alpha: float = 0.05
    decision: str
    practical_interpretation: str
    limitations: str
    evidence_based_conclusion: str
    chart_type: str
    chart_data: Any

class QuestionsListResponse(BaseModel):
    total_questions: int
    questions: List[QuestionDetail]

class HypothesisTestItem(BaseModel):
    question: str
    test: str
    statistic_name: str
    statistic: float
    p_value: float
    p_value_adjusted_BH: float
    n: int
    effect_name: Optional[str] = None
    effect_value: Optional[float] = None
    significant_raw_005: bool
    significant_BH_005: bool
    notes: Optional[str] = ""

class HypothesisSummaryResponse(BaseModel):
    total_tests: int
    significant_raw_count: int
    significant_bh_count: int
    tests: List[HypothesisTestItem]

class ModelMetricRow(BaseModel):
    model: str
    accuracy: float
    balanced_accuracy: float
    macro_F1: float
    weighted_F1: float

class ConfusionMatrixData(BaseModel):
    labels: List[str]
    matrix_normalized: List[List[float]]
    matrix_counts: List[List[int]]

class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float

class ModelMetricsResponse(BaseModel):
    model_metrics: List[ModelMetricRow]
    classification_report: Dict[str, Any]
    confusion_matrix: ConfusionMatrixData
    top_feature_importance: List[FeatureImportanceItem]
    model_configuration: Dict[str, Any]

class ExplorerRecord(BaseModel):
    data: Dict[str, Any]

class ExplorerResponse(BaseModel):
    total_records: int
    filtered_records: int
    page: int
    page_size: int
    total_pages: int
    columns: List[str]
    numeric_columns: List[str]
    categorical_columns: List[str]
    records: List[Dict[str, Any]]
    summary_stats: Dict[str, Dict[str, float]]
