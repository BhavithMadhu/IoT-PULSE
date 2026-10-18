# IoT PULSE — Tableau Implementation & Demonstration Guide

This guide details how to open, view, and interact with the **IoT PULSE Cybersecurity Analytics Dashboard** using Tableau Desktop or Tableau Public.

---

## 1. Overview & Cross-Platform Support

Unlike Power BI Desktop (which is Windows-only), **Tableau runs natively on both macOS and Windows**.

- **Workbook File:** `tableau/IoT_PULSE_Cybersecurity_Analytics.twb`
- **Data Source Folder:** `../exports/` (contains all 10 verified pre-aggregated and clean analytical CSVs)
- **Included Dashboard:** `IoT PULSE Executive Dashboard`
- **Pre-configured Worksheets:**
  1. `Attack Distribution` (Class volume, percentage, and normal vs. malicious coloring)
  2. `Protocol Composition` (Protocol breakdown showing 89.69% TCP vs 10.23% UDP)
  3. `Model Evaluation` (Random Forest vs. Majority Baseline comparison across Macro-F1 and Balanced Accuracy)
  4. `Feature Importances` (Gini impurity rankings for top discriminative flow features)

---

## 2. Quick Start: Opening the Dashboard in Tableau

### Step 1: Open Tableau
1. Launch **Tableau Desktop** or **Tableau Public** (freely available for macOS and Windows).
2. Click **File -> Open** (or press `Cmd + O` / `Ctrl + O`).
3. Select `tableau/IoT_PULSE_Cybersecurity_Analytics.twb` from this repository.

### Step 2: Automatic Data Source Linkage
The workbook is pre-configured with relative paths to the CSV files in `exports/`:
- `exports/AttackDistribution.csv`
- `exports/ProtocolDistribution.csv`
- `exports/HypothesisTestResults.csv`
- `exports/ModelMetrics.csv`
- `exports/FeatureImportance.csv`

If Tableau prompts for location verification:
- Click **Locate** and point to the `exports/` folder within this repository.

---

## 3. Alternative: Connecting Tableau to Live FastAPI Endpoints (Web Data Connector / CSV Live Feed)

If you wish to demonstrate the full-stack live pipeline in Tableau:
1. Ensure the FastAPI backend is running:
   ```bash
   python3 -m uvicorn backend.app.main:app --port 8000
   ```
2. In Tableau, select **Connect -> To a Server -> Web Data Connector** (or connect via HTTP to `/api/export/{table_name}`).
3. Alternatively, export live CSV endpoints from:
   - `http://localhost:8000/api/export/attacks`
   - `http://localhost:8000/api/export/protocols`
   - `http://localhost:8000/api/export/hypotheses`
   - `http://localhost:8000/api/export/model-metrics`
   - `http://localhost:8000/api/export/feature-importance`

---

## 4. Key Metrics Displayed in the Dashboard

| Metric | Source Table | Analytical Value |
|---|---|---|
| Total Flow Records | `AttackDistribution.csv` | 123,117 flows |
| Recorded Attack Labels | `AttackDistribution.csv` | 12 classes (1 Normal + 11 Attacks) |
| Normal Traffic Ratio | `AttackDistribution.csv` | 10.16% Normal vs. 89.84% Malicious |
| Majority Attack Label | `AttackDistribution.csv` | `DOS_SYN_Hping` (94,089 records, 76.42%) |
| TCP Traffic Ratio | `ProtocolDistribution.csv` | 89.69% TCP (driven by SYN flooding) |
| Random Forest Macro-F1 | `ModelMetrics.csv` | **0.9338** (vs. 0.0724 Baseline) |
| RF Balanced Accuracy | `ModelMetrics.csv` | **0.8872** (vs. 0.0833 Baseline) |
| Top Discriminating Feature | `FeatureImportance.csv` | `fwd_pkts_tot` / `fwd_data_pkts_tot` |
