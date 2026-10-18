# IoT PULSE — Power BI Desktop Implementation Guide

This document provides step-by-step instructions to construct, configure, and refresh the official 5-page **IoT PULSE Cybersecurity Analytics Dashboard** in Power BI Desktop.

> [!NOTE]
> **Platform & Compatibility Notice:**
> Microsoft Power BI Desktop is natively built for Windows OS. On macOS environments, native `.pbix` authoring is not directly supported by Microsoft. However, all underlying analytical tables, Power Query M connection scripts, DAX measures, and schema specifications are fully provided in this folder and the `exports/` folder. They can be opened and refreshed in Power BI Desktop on any Windows machine, Parallels VM, or Power BI Service workspace.

---

## 1. Connection Architecture: Two Integration Paths

### Method A: Live REST API Connection (Recommended for Dynamic Refresh)
1. Ensure the FastAPI backend is running:
   ```bash
   uvicorn backend.app.main:app --reload --port 8000
   ```
2. In Power BI Desktop:
   - Click **Get Data** -> **Blank Query** -> **Advanced Editor**.
   - Paste the corresponding query from `powerbi/PowerQuery_M_Templates.pq`.
   - Name each query as specified: `AttackDistribution`, `ProtocolDistribution`, `ServiceDistribution`, `FeatureSummary`, `HypothesisTestResults`, `ModelMetrics`, `FeatureImportance`.
3. Click **Close & Apply**.
4. To refresh data, simply click the **Refresh** button in the Power BI ribbon. Power BI will query the live FastAPI endpoints and update all visuals.

### Method B: Curated CSV Import Fallback (Offline Mode)
1. In Power BI Desktop, click **Get Data** -> **Text/CSV**.
2. Navigate to the `exports/` folder in this repository.
3. Import the generated CSV files:
   - `AttackDistribution.csv`
   - `ProtocolDistribution.csv`
   - `ServiceDistribution.csv`
   - `FeatureSummary.csv`
   - `HypothesisTestResults.csv`
   - `CorrelationResults.csv`
   - `ModelMetrics.csv`
   - `ConfusionMatrix.csv`
   - `FeatureImportance.csv`
   - `iot_pulse_clean_flows.csv`
4. Set column types as specified in `Schema_Diagram.md`.

---

## 2. Setting Up Relationships & Data Model

Navigate to the **Model View** in Power BI Desktop and verify the following relationships:
1. `AttackDistribution[Attack_Type]` -> `Flows[Attack_type]` (1 to Many, Single Cross-Filter)
2. `ProtocolDistribution[Protocol]` -> `Flows[proto]` (1 to Many, Single Cross-Filter)
3. `ServiceDistribution[Service]` -> `Flows[service]` (1 to Many, Single Cross-Filter)

Create a new table named `_Measures` and copy all formulas from `powerbi/DAX_Measures.dax`.

---

## 3. Five-Page Report Visual Specifications

### PAGE 1 — Executive Overview
* **Theme:** Dark cyber / slate theme (Background: `#0B1120`, Card fill: `#1E293B`, Accents: `#06B6D4`, `#10B981`, `#EF4444`).
* **Header:**
  - Title: *"IoT PULSE — Executive Cybersecurity Overview"*
  - Subtitle: *"Macro traffic distribution, class balance, and baseline operational metrics"*
* **KPI Cards (Top Ribbon):**
  1. **Total Flow Records:** Card visual showing `[Total_Flow_Records]` (123,117).
  2. **Attack Categories:** Card visual showing `[Distinct_Attack_Labels]` (12).
  3. **Normal Traffic Share:** Card visual showing `[Normal_Traffic_Share_Pct]` (10.16%).
  4. **Dominant Attack Class:** Card visual showing `[Majority_Attack_Label]` (`DOS_SYN_Hping`).
  5. **Random Forest Macro-F1:** Card visual showing `[RF_Macro_F1]` (0.9338).
* **Main Visuals:**
  - **Attack Label Breakdown (Donut/Bar Chart):** `AttackDistribution[Attack_Type]` vs `AttackDistribution[Record_Count]`, colored by `Is_Normal`.
  - **Normal vs Malicious Telemetry (Gauge / Donut):** Shows 89.84% Malicious vs 10.16% Normal.
  - **Protocol Composition (Treemap / Bar):** `ProtocolDistribution[Protocol]` vs `ProtocolDistribution[Record_Count]`. Shows TCP dominance (89.69%) driven by SYN floods.

---

### PAGE 2 — Attack Behaviour & Network Flow Profiles
* **Header:** *"Attack Behaviour & Deep Flow Profiling"*
* **Slicers:**
  - Dropdown Slicer for `AttackDistribution[Attack_Type]`.
  - Dropdown Slicer for `ProtocolDistribution[Protocol]`.
* **Visuals:**
  - **Flow Duration Across Attack Labels (Clustered Bar Chart):** X-axis: `Attack_type`, Y-axis: Median Flow Duration (seconds). Demonstrates that normal MQTT flows persist for ~44 seconds, while automated port scans and SYN floods terminate within milliseconds.
  - **Bidirectional Packet Volumes (Scatter Chart):** X-axis: `fwd_pkts_tot`, Y-axis: `bwd_pkts_tot`, Legend: `Attack_type`. Highlights bidirectional dialogue vs unidirectional spoofing.
  - **Packet Rate Intensity (Column Chart):** Logarithmic scale comparing transmission intensity (packets/sec) across categories.

---

### PAGE 3 — Statistical Evidence & Hypotheses
* **Header:** *"Empirical Statistical Investigation (15 Research Questions)"*
* **KPI Ribbon:**
  - **Total Inferential Hypotheses:** 11.
  - **Raw Significant Tests (α=0.05):** 11.
  - **BH-FDR Adjusted Significant Tests:** 11 (100% survival rate).
* **Main Visuals:**
  - **Consolidated Hypothesis Testing Table (Matrix/Table):**
    - Columns: `Question`, `Test_Method`, `Statistic_Name`, `Statistic_Value`, `P_Value_Raw`, `P_Value_Adjusted_BH`, `Effect_Size_Name`, `Effect_Size_Value`, `Significant_BH`, `Notes`.
    - Conditional Formatting: Green fill on `Significant_BH = TRUE`.
  - **High-SYN Counter-Intuition Card (Q10 Callout):**
    - Displays DOS_SYN_Hping high-SYN share (0.00%) vs Other Labels (37.15%), z = -196.12, 95% CI: `[-0.3771, -0.3658]`.
    - Contextual tooltip explaining that single-packet SYN floods deliberately omit handshake completion.

---

### PAGE 4 — Machine Learning & Model Evaluation
* **Header:** *"Multiclass Machine Learning Evaluation (Random Forest)"*
* **KPI Cards:**
  - **Macro-F1 Score:** Card visual showing `[RF_Macro_F1]` (0.9338).
  - **Balanced Accuracy:** Card visual showing `[RF_Balanced_Accuracy]` (0.9380).
  - **Baseline Macro-F1:** Card visual showing `[Baseline_Macro_F1]` (0.0724).
  - **Macro-F1 Gain:** Card visual showing `[Macro_F1_Lift]` (+0.8614).
* **Main Visuals:**
  - **Confusion Matrix (Heatmap Matrix):**
    - Rows: Actual `Attack_type`.
    - Columns: Predicted `Attack_type`.
    - Values: Row-normalized true-positive rates. Diagonal highlighted in gradient blue.
  - **Top 20 Predictive Feature Importances (Horizontal Bar Chart):**
    - Y-axis: `FeatureImportance[Feature]`.
    - X-axis: `FeatureImportance[Importance]`.
    - Features: `fwd_header_size_min`, `fwd_last_window_size`, `fwd_PSH_flag_count`, `fwd_URG_flag_count`, `fwd_pkts_payload.avg`.
  - **Evaluation Disclaimer Callout:**
    - "Model performance reflects offline testbed separability. Tabular evaluation does not guarantee generalization to unseen IoT devices or production network zero-days."

---

### PAGE 5 — Data Quality & Methodology
* **Header:** *"Data Provenance, Quality Audit & Research Limitations"*
* **Visuals:**
  - **Missing Values Audit (Table/Card):** Confirms 0 missing values across all 84 analytical features.
  - **Duplicate Audit Card:** 0 full duplicate rows; 1,180 repeated feature signatures (label ignored) preserved to reflect genuine IoT telemetry bursts.
  - **Feature Outlier Summary (Table):** Features with highest IQR outlier percentages (`payload_bytes_per_second`, `flow_pkts_per_sec`).
  - **Academic Observational Caveat Callout:**
    - Explicit note clarifying that two-group protocol comparisons (TCP vs UDP, MQTT vs Non-MQTT) are **observational studies**, not randomized A/B trials.
