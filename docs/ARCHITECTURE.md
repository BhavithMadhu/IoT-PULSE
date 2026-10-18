# IoT PULSE — System Architecture & Data Flow Specification

## 1. High-Level Architecture Overview

**IoT PULSE** is a full-stack cybersecurity analytics application designed to uncover statistical patterns of normal and malicious IoT network behavior in the **RT-IOT2022** dataset (123,117 flow records, 84 analytical features).

```mermaid
flowchart TD
    subgraph DataLayer["Data Layer (Source of Truth)"]
        CSV["RT_IOT2022.csv<br/>(123,117 Flows, 85 Raw Columns)"]
        Clean["In-Memory Pandas DataFrame<br/>(84 Analytical Features, 0 Missing)"]
        Duck["DuckDB In-Memory SQL Engine<br/>('flows' Virtual Table)"]
    end

    subgraph AnalyticsBackend["Analytics Backend (FastAPI + Python 3.9)"]
        Loader["data_loader.py<br/>(Singleton Preprocessor & Cache)"]
        DS["data_service.py<br/>(Overview, Distributions, Outliers)"]
        SS["statistics_service.py<br/>(Questions Q1-Q15, Correlations)"]
        HS["hypothesis_service.py<br/>(Inferential Tests, Benjamini-Hochberg)"]
        MS["model_service.py<br/>(Random Forest Pipeline, Baseline, Importances)"]
        ES["export_service.py<br/>(Curated CSV & Parquet Tables)"]
    end

    subgraph ClientLayers["Client Interfaces"]
        direction TB
        subgraph WebUI["Web Interface (React + Vite)"]
            P1["Overview Dashboard"]
            P2["Attack Intelligence"]
            P3["Exploratory Data Analysis"]
            P4["Statistical Investigation (Q1-Q15)"]
            P5["Hypothesis Testing & FDR"]
            P6["Machine Learning & CM"]
            P7["Data Explorer (Server-Side)"]
            P8["Methodology & Conclusions"]
        end
        subgraph BIPlatform["Business Intelligence (Power BI Desktop)"]
            PQ["Power Query M Connectors<br/>(Live API & CSV Fallback)"]
            DAX["DAX Enterprise Measures"]
            PBI_Pages["5 Executive & Forensic Report Pages"]
        end
    end

    CSV --> Loader
    Loader --> Clean
    Clean --> Duck
    Clean --> DS & SS & HS & MS & ES
    Duck --> DS
    DS & SS & HS & MS & ES --> FastAPI["FastAPI REST Endpoints (/api/*)"]
    FastAPI --> WebUI
    FastAPI --> PQ
    ES -->|Exports CSV| BIPlatform
```

---

## 2. End-to-End Analytical Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Analyst as Security Analyst
    participant Frontend as React + Vite Web UI
    participant API as FastAPI REST Gateway
    participant DuckDB as DuckDB In-Memory SQL
    participant Scipy as SciPy / Statsmodels Engine
    participant Model as Scikit-Learn Pipeline
    participant Disk as Local File Exports

    Analyst->>Frontend: Select Filters (Attack: DOS_SYN_Hping, Proto: TCP)
    Frontend->>API: GET /api/flows?attack_type=DOS_SYN_Hping&proto=tcp&page=1
    API->>DuckDB: SELECT ... FROM flows WHERE Attack_type=? AND proto=? LIMIT 50
    DuckDB-->>API: 50 matching flow tuples + summary aggregates (sub-10ms)
    API-->>Frontend: JSON Response (records, stats, pagination meta)
    Frontend-->>Analyst: Render Cyber Data Grid & Aggregates

    Analyst->>Frontend: View Statistical Investigation (Q1 - Q15)
    Frontend->>API: GET /api/statistics/questions
    API->>Scipy: Retrieve verified test statistics (χ², Kruskal-Wallis, Mann-Whitney, Spearman)
    Scipy-->>API: 15 questions with exact test stats, p-values, effect sizes & conclusions
    API-->>Frontend: Return QuestionsListResponse
    Frontend-->>Analyst: Interactive Cards & Contextual Charts

    Analyst->>Frontend: View Machine Learning Performance
    Frontend->>API: GET /api/model/metrics
    API->>Model: Retrieve pre-trained RF & Dummy baseline evaluation
    Model-->>API: Macro-F1 (0.934), Balanced Acc (0.938), Confusion Matrix, Feature Importances
    API-->>Frontend: Return ModelMetricsResponse
    Frontend-->>Analyst: Render Heatmap Matrix & Importance Charts
```

---

## 3. Component Details & Performance Rationale

1. **Singleton Preprocessor & In-Memory DuckDB Connection:**
   - The 123,117-row dataset is cleaned on application startup once.
   - Exact preprocessing from `IoT_PULSE_RT_IOT2022_FINAL_Case_Study.ipynb` is mirrored: whitespace stripping, index-like column removal (`Unnamed: 0`), non-numeric coercion, and dropping labels missing the target.
   - DuckDB registers the in-memory dataframe as `flows`. SQL queries with `WHERE`, `ORDER BY`, `LIMIT`, and `OFFSET` complete in 2 to 8 milliseconds without copying data.

2. **Cached Machine Learning Artifacts:**
   - Random Forest model (120 trees, max depth 18, class weighting `balanced_subsample`) is trained on a stratified 50,000-flow sample on startup in ~0.7 seconds.
   - Predictions, confusion matrix, and feature importances are computed once and stored in memory. Subsequent API calls respond in < 1 ms.

3. **Power BI Dual-Mode Integration:**
   - **Mode A (Live REST API):** Power Query M scripts use `Web.Contents` to dynamically pull JSON streams from the running backend.
   - **Mode B (Curated CSV Tables):** Export service writes 10 pre-aggregated, typed CSV tables to `exports/` for direct, high-speed file loading.
