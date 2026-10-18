# IoT PULSE — Power BI Data Model & Schema Architecture

## 1. Relational Star Schema Architecture

The analytical data model uses a Star / Snowflake architecture optimized for interactive filtering, high-speed aggregations, and slice-and-dice across attack categories and network protocols.

```mermaid
erDiagram
    AttackDistribution ||--o{ Flows : "filters by Attack_type (1:N)"
    ProtocolDistribution ||--o{ Flows : "filters by proto (1:N)"
    ServiceDistribution ||--o{ Flows : "filters by service (1:N)"
    FeatureSummary ||--o{ Flows : "metadata dimension"
    ModelMetrics ||--o{ FeatureImportance : "model performance context"
    HypothesisTestResults }o--|| StatisticalQuestions : "inferential link"

    Flows {
        string Attack_type PK
        string proto FK
        string service FK
        float flow_duration
        int fwd_pkts_tot
        int bwd_pkts_tot
        float flow_pkts_per_sec
        float payload_bytes_per_second
        int flow_SYN_flag_count
        int flow_ACK_flag_count
        float down_up_ratio
    }

    AttackDistribution {
        string Attack_Type PK
        int Record_Count
        float Percentage
        boolean Is_Normal
    }

    ProtocolDistribution {
        string Protocol PK
        int Record_Count
        float Percentage
    }

    ServiceDistribution {
        string Service PK
        int Record_Count
        float Percentage
    }

    FeatureSummary {
        string Feature PK
        string Data_Type
        float Mean
        float Median
        float IQR
        float Outlier_Percentage
    }

    HypothesisTestResults {
        string Question PK
        string Test_Method
        float Statistic_Value
        float P_Value_Raw
        float P_Value_Adjusted_BH
        float Effect_Size_Value
        boolean Significant_BH
    }

    ModelMetrics {
        string Model_Name PK
        float Accuracy
        float Balanced_Accuracy
        float Macro_F1
        float Weighted_F1
    }

    FeatureImportance {
        string Feature PK
        float Importance
    }
```

---

## 2. Table Cardinalities & Cross-Filtering Behavior

| From Table (Dimension) | To Table (Fact) | Join Key | Cardinality | Cross Filter Direction | Security / Filter Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `AttackDistribution` | `Flows` | `Attack_Type` = `Attack_type` | 1 to Many (1:*) | Single (Dimension to Fact) | Selecting an attack filters all flow aggregations |
| `ProtocolDistribution` | `Flows` | `Protocol` = `proto` | 1 to Many (1:*) | Single (Dimension to Fact) | Filtering by protocol isolates TCP / UDP / ICMP |
| `ServiceDistribution` | `Flows` | `Service` = `service` | 1 to Many (1:*) | Single (Dimension to Fact) | Filters by application service (MQTT, HTTP, DNS) |
| `FeatureImportance` | Independent Fact | `Feature` | N/A | None | Displays top predictive drivers |
| `HypothesisTestResults`| Independent Fact | `Question` | N/A | None | Provides formal inferential evidence |
| `ModelMetrics` | Independent Fact | `Model_Name` | N/A | None | Evaluates Random Forest vs baseline |
