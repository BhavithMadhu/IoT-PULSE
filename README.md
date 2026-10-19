# IoT PULSE — From Traffic to Threats
### Uncovering Statistical Patterns of Normal and Malicious IoT Network Behaviour
**Course:** Foundations of Data Science (23CSE351)  
**Dataset:** RT-IOT2022 (123,117 bidirectional network flow records × 84 analytical features)  
**Architecture:** Full-Stack Cybersecurity Analytics Engine (FastAPI + DuckDB + React/Vite + Power BI Desktop)

---

## 1. Executive Summary & Problem Statement

Internet of Things (IoT) ecosystems introduce heterogeneous protocols (MQTT, HTTP, DNS) and high-volume communication flows. Cyber adversaries exploit these environments through denial-of-service floods, reconnaissance sweeps, and protocol-level poisoning. 

**IoT PULSE** transforms an offline exploratory case study into an enterprise-grade full-stack cybersecurity analytics platform. Built strictly on empirical data from the **RT-IOT2022** dataset, the platform couples statistical hypothesis testing, non-parametric inference, sub-millisecond in-memory SQL querying via DuckDB, machine learning benchmarking, an interactive dark-cyber web interface, and an enterprise 5-page Power BI dashboard.

### Core Case Study Highlights
* **Analyzed Sample:** 123,117 bidirectional flow records across 12 distinct classes.
* **Severe Class Imbalance:** `DOS_SYN_Hping` accounts for 76.89% (94,659 flows), while minority classes like `NMAP_FIN_SCAN` account for 0.02% (28 flows) — establishing why overall accuracy is practically misleading.
* **15 Statistical Questions Answered:** Complete mathematical tests with test statistics, degrees of freedom, p-values, and effect sizes (Cramér's V, Rank-Biserial correlation, \(\eta^2\)).
* **Multiple Testing Correction:** All 11 inferential tests survive Benjamini–Hochberg False Discovery Rate (FDR) control at \(\alpha = 0.05\) (adjusted \(p < 0.0001\)).
* **Counter-Intuitive Finding (Q10):** Legitimate handshakes exhibit a 37.15% high-SYN rate (&gt;1 flag), while `DOS_SYN_Hping` has 0.0% (single-packet flood emission without handshake completion; \(z = -196.12, p < 0.0001\)).
* **Machine Learning Superiority (Q15):** Random Forest achieves a Macro-F1 of **0.9338** and Balanced Accuracy of **0.9380**, outperforming the majority baseline (Macro-F1 **0.0724**) with port numbers excluded to prevent shortcut memorization.

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Source of Truth Dataset                         │
│             RT_IOT2022.csv (123,117 Flows · 85 Raw Columns)            │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌──────────────────────────────────────┐ ┌───────────────────────────────┐
│       FastAPI Analytics Engine       │ │   Curated Analytical Exports  │
│ - DuckDB In-Memory SQL ('flows')     │ │ - 10 Pre-Aggregated Tables    │
│ - SciPy / Statsmodels Inferential    │ │ - Parquet & CSV Data Model    │
│ - Scikit-Learn RF Pipeline & Cache   │ └───────────────┬───────────────┘
└───────────────────┬──────────────────┘                 │
                    │ REST / JSON                        │ Power Query M / CSV
                    ▼                                    ▼
┌──────────────────────────────────────┐ ┌───────────────────────────────┐
│       React + Vite Web Platform      │ │       Power BI Desktop        │
│ - Dark Cyber SOC Aesthetic           │ │ - 5 Interactive BI Pages      │
│ - 8 Comprehensive Forensic Views     │ │ - Enterprise DAX Library      │
│ - Server-Side DuckDB Data Explorer   │ │ - Star Schema Data Model      │
└──────────────────────────────────────┘ └───────────────────────────────┘
```

---

## 3. Quickstart & Installation (macOS, Linux & Windows)

### Prerequisites
* **Python 3.9+** (installed and available via `python` or `python3`)
* **Node.js 18+** & **npm** (installed and available via `node` and `npm`)

### 1. Install Backend Dependencies
From the repository root:
```bash
pip install -r backend/requirements.txt
```
*(Dependencies: `fastapi`, `uvicorn`, `pydantic`, `duckdb`, `pandas`, `numpy`, `scipy`, `scikit-learn`, `statsmodels`, `httpx`, `pytest`)*

### 2. Install Frontend Dependencies
```bash
npm --prefix frontend install
```

### 3. Launch Both Services Concurrently

#### Windows (PowerShell)
```powershell
.\start.ps1
```

#### Windows (Command Prompt / Double Click)
```cmd
start.bat
```

#### macOS / Linux (Bash)
```bash
chmod +x start.sh
./start.sh
```

Or run the services manually in separate terminal windows:
* **Terminal 1 (Backend):**
  ```bash
  python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
  ```
* **Terminal 2 (Frontend):**
  ```bash
  npm --prefix frontend run dev
  ```

### Access URLs
* **Web Dashboard:** [http://localhost:5173](http://localhost:5173)
* **Interactive Swagger API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **API Health Check:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 4. 3D Cyber Defense Holographic Engine

IoT-PULSE features an interactive 3D spatial threat topology globe built with **Three.js** and **React Three Fiber**:

* **Procedural Cyber Earth Topography (`globeTexture.js`):** Generates high-definition world continent silhouettes and illuminated cyber dot-matrix landmasses completely offline using HTML5 Canvas.
* **Vertical Light Beacons & Shockwaves:** Nodes project vertical holographic laser pillars scaled to traffic volume (with the 94k DOS SYN flood rising as the dominant epicenter) surrounded by expanding ground ripple rings.
* **Streaming Photon Energy Arcs:** Dynamic 3D quadratic Bezier arcs with real-time moving photon packets that stream between threat sources and legitimate IoT telemetry cloud gateways.
* **Gyroscopic Defense Gimbal:** Dual-axis tactical rings and an orbiting sentinel recon satellite.
* **Glassmorphic Telemetry Cockpit HUD:** Real-time threat classification tags, category filter buttons (`All`, `Threats`, `Normal`), and simulated volumetric attack surge mode.

---

---

## 5. API Endpoints Reference

The backend provides documented, typed, and validated REST endpoints under `/api`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend status, record count, and DuckDB engine health |
| `GET` | `/api/overview` | Executive KPIs, normal vs malicious share, top attack classes |
| `GET` | `/api/attacks/distribution` | Empirical counts, percentages, and normal tags across all 12 classes |
| `GET` | `/api/protocols` | Layer 4 transport protocol distribution (TCP, UDP, ICMP) |
| `GET` | `/api/services` | Application service distribution (MQTT, HTTP, DNS, SSL) |
| `GET` | `/api/features/summary` | Summary statistics, IQR, and Tukey outlier counts across 81 numeric features |
| `GET` | `/api/statistics/questions` | All 15 research questions with complete 12 metadata attributes & charts |
| `GET` | `/api/statistics/questions/{qid}` | Individual question deep-dive by ID (`Q1` to `Q15`) |
| `GET` | `/api/correlations` | Spearman rank correlation matrix across 12 selected flow features |
| `GET` | `/api/hypotheses` | Formal inferential tests with Benjamini–Hochberg FDR adjustments |
| `GET` | `/api/model/metrics` | Random Forest vs Dummy baseline evaluation, classification report |
| `GET` | `/api/model/confusion-matrix` | 12×12 normalized confusion matrix and absolute flow counts |
| `GET` | `/api/model/feature-importance` | Top 25 predictive feature importances (Gini MDI) |
| `GET` | `/api/flows` | Server-side DuckDB query with filtering, sorting, and bounded pagination |
| `GET` | `/api/export/{table_name}` | Download curated Power BI-ready CSV tables |
| `POST`| `/api/export/generate` | Trigger on-demand regeneration of all analytical export tables |

---

## 6. Summary of All 15 Research Questions

All 15 questions from `IoT_PULSE_RT_IOT2022_FINAL_Case_Study.ipynb` are preserved and computed from actual data:

| ID | Title | Statistical Method | Key Result / Test Statistic | p-Value (Raw & BH) | Effect Size | Academic Conclusion |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Q1** | Attack Label Distribution | Frequency & Class Share | Majority: `DOS_SYN_Hping` (76.89%) | N/A (Descriptive) | Ratio: 3,380:1 | Extreme class imbalance requires macro-F1. |
| **Q2** | Protocol by Attack Label | \(\chi^2\) Test of Independence | \(\chi^2 = 83,803.125\), df = 22 | \(p < 0.0001\) | Cramér's V = 0.5834 | Attacks exhibit strict protocol targeting. |
| **Q3** | Service by Attack Label | \(\chi^2\) Test (Infrequent &lt;100 grouped) | \(\chi^2 = 301,729.097\), df = 66 | \(p < 0.0001\) | Cramér's V = 0.6391 | MQTT isolates telemetry; attacks use null/HTTP. |
| **Q4** | Flow Duration by Attack | Kruskal–Wallis H Test | \(H = 44,749.478\), 11 groups | \(p < 0.0001\) | \(\eta^2 \approx 0.3635\) | MQTT holds sessions (44s); DoS terminates in 0ms. |
| **Q5** | Total Packets by Attack | Kruskal–Wallis H Test | \(H = 59,302.945\), 11 groups | \(p < 0.0001\) | \(\eta^2 \approx 0.4818\) | SSH Brute Force (27 pkts) vs SYN flood (1 pkt). |
| **Q6** | Forward vs Backward Packets | Spearman Rank Correlation | Spearman \(\rho = 0.7463\) | \(p < 0.0001\) | \(\rho = 0.7463\) | Reciprocal communication in bidirectional flows. |
| **Q7** | TCP vs UDP Packet Rate | Mann–Whitney U Test | \(U = 1.208 \times 10^9\) | \(p < 0.0001\) | \(r_{\text{rb}} = 0.7314\) | TCP median (493k pkts/s) dwarfs UDP (46 pkts/s). |
| **Q8** | TCP vs UDP Payload Rate | Mann–Whitney U Test | \(U = 1.159 \times 10^9\) | \(p < 0.0001\) | \(r_{\text{rb}} = 0.6622\) | TCP payload (29.6 MB/s) inflated by flood volume. |
| **Q9** | SYN Flags Across Attacks | Kruskal–Wallis H Test | \(H = 57,883.196\), 11 groups | \(p < 0.0001\) | \(\eta^2 \approx 0.4703\) | Complete handshakes (2) vs half-open floods (1). |
| **Q10**| High-SYN DOS_SYN_Hping vs Other | Two-Proportion z-Test | \(z = -196.1240\) | \(p < 0.0001\) | Diff: \(-0.3715\) | DOS has 0.0% high-SYN (&gt;1 flag); others have 37.15%. |
| **Q11**| Flow Duration vs Packet Rate | Spearman Rank Correlation | Spearman \(\rho = -0.2959\) | \(p < 0.0001\) | \(\rho = -0.2959\) | Shorter flows show bursty, dense packet rates. |
| **Q12**| Inter-Feature Correlation | Spearman Matrix (12 features) | Max \(|\rho| = 0.7463\) | N/A (Exploratory) | Collinear blocks | Tree-based models are well-suited for tabular data. |
| **Q13**| Forward/Backward Ratio | Kruskal–Wallis H Test | \(H = 35,188.375\), 11 groups | \(p < 0.0001\) | \(\eta^2 \approx 0.2858\) | ARP spoofing drops to 0.0 (unidirectional). |
| **Q14**| MQTT vs Non-MQTT Duration | Mann–Whitney U Test | \(U = 4.883 \times 10^8\) | \(p < 0.0001\) | \(r_{\text{rb}} = 0.9864\) | MQTT maintains long persistent channels (44.09s). |
| **Q15**| Multiclass Classification | Random Forest (120 Trees) | Macro-F1 = 0.9338, Bal Acc = 0.9380 | \(p < 0.0001\) | Gain: +0.8614 | Strong class separation with port shortcuts excluded. |

---

## 7. Power BI Desktop Integration

The `powerbi/` and `exports/` directories provide a complete Power BI implementation:

### Integration Modes
1. **Live REST API Mode:** Uses Power Query M templates (`powerbi/PowerQuery_M_Templates.pq`) to dynamically ingest JSON endpoints from `http://127.0.0.1:8000/api/*`.
2. **Direct CSV Import Fallback:** High-performance local file loading from `exports/*.csv`.

### 5-Page Report Design
* **PAGE 1 — Executive Overview:** Total flows (123,117), attack class count (12), normal traffic percentage (10.16%), majority share (76.89%), transport protocol donut chart.
* **PAGE 2 — Attack Behaviour:** Flow durations across attack labels, bidirectional packet volumes, packet transmission rates on linear and logarithmic scales.
* **PAGE 3 — Statistical Evidence:** Formal inferential results matrix, raw and Benjamini–Hochberg adjusted p-values, high-SYN counter-intuitive callout card (Q10).
* **PAGE 4 — Machine Learning:** Macro-F1 (0.9338) vs baseline (0.0724), 12×12 row-normalized confusion matrix heatmap, top 20 feature importances (minimum forward header size, window dimensions, PSH flags).
* **PAGE 5 — Data Quality & Methodology:** 0 missing values audit, 1,180 repeated signature flags, Tukey IQR outlier summary, and observational two-group comparison disclaimer.

---

## 8. Automated Testing & Validation

The project includes an automated test suite verifying endpoint schemas, analytical parity with the Jupyter notebook, and data integrity:

```bash
python -m pytest backend/tests -v
```

### Verified Test Results (17/17 Passed)
* `test_health.py`: Verifies status 200, 123,117 total records, DuckDB in-memory status, and KPI sanity.
* `test_statistics.py`: Validates mathematical parity for all 15 questions down to exact test statistics (e.g., \(\chi^2 = 83,803.12\), Kruskal-Wallis \(H = 44,749.48\), Two-proportion \(z = -196.12\), Spearman \(\rho = 0.7463\)).
* `test_model.py`: Asserts Random Forest Macro-F1 &gt; 0.90, baseline Macro-F1 &lt; 0.15, 12×12 confusion matrix dimensions, and positive feature importances.
* `test_explorer.py`: Confirms DuckDB bounded pagination, attack filtering, protocol filtering, and parameter validation (422 status code on invalid sort).
* `test_exports.py`: Validates CSV export headers, row counts, and HTTP file downloads.

---

## 9. Academic Rigor & Ethical Boundaries

> [!IMPORTANT]
> **Observational Two-Group Comparisons vs Randomized A/B Testing:**
> The comparisons between TCP and UDP (Q7, Q8), DOS_SYN_Hping and other labels (Q10), and MQTT and non-MQTT (Q14) are **observational two-group statistical comparisons**. They do **NOT** constitute randomized A/B experiments because network flows were not randomly assigned to transport protocols or service types via an experimental treatment. Statistical significance demonstrates evidence against the null distribution within this dataset; it does not prove causation or guarantee performance on unseen physical networks.

---

## 10. Project Deliverables Structure

```text
IoT-PULSE/
├── RT_IOT2022.csv                              # Source dataset (123,117 flows × 85 cols)
├── IoT_PULSE_RT_IOT2022_FINAL_Case_Study.ipynb # Original verified Jupyter notebook
├── start.sh                                    # Bash dev server launcher (macOS/Linux)
├── start.ps1                                   # PowerShell launcher with health polling (Windows)
├── start.bat                                   # Double-click cmd launcher (Windows)
├── .env.example                                # Environment variable template
├── .gitignore                                  # Git exclusion configuration
├── README.md                                   # Master project documentation
├── backend/
│   ├── requirements.txt                        # Backend dependencies
│   ├── app/
│   │   ├── main.py                             # FastAPI app, lifespan cache, CORS
│   │   ├── config.py                           # Settings and environment bindings
│   │   ├── data/data_loader.py                 # Singleton preprocessor & DuckDB connection
│   │   ├── services/                           # Modular analytical services
│   │   │   ├── data_service.py                 # Overview, distributions, DuckDB explorer
│   │   │   ├── statistics_service.py           # 15 research questions & correlation matrix
│   │   │   ├── hypothesis_service.py           # Inferential tests & Benjamini-Hochberg FDR
│   │   │   ├── model_service.py                # Random Forest pipeline & confusion matrix
│   │   │   └── export_service.py               # Analytical table export generator
│   │   ├── routers/                            # REST endpoint controllers
│   │   │   ├── health.py                       # Health checks
│   │   │   ├── overview.py                     # High-level KPIs
│   │   │   ├── attacks.py                      # Attack, protocol, service distributions
│   │   │   ├── statistics.py                   # Questions Q1-Q15 & correlations
│   │   │   ├── hypotheses.py                   # Hypothesis summary & FDR table
│   │   │   ├── model.py                        # Model metrics, confusion matrix, importance
│   │   │   ├── explorer.py                     # Server-side DuckDB flow querying
│   │   │   └── export.py                       # Curated CSV table downloads
│   │   └── schemas/                            # Pydantic request/response models
│   │       ├── responses.py                    # Output schemas
│   │       └── filters.py                      # Query validation schemas
│   └── tests/                                  # Pytest test suite (17 passed)
├── frontend/                                   # React + Vite Web Application
│   ├── package.json                            # Vite 6 + React 18 + Lucide dependencies
│   ├── vite.config.js                          # Vite configuration
│   ├── index.html                              # Web shell
│   └── src/
│       ├── main.jsx                            # Entrypoint
│       ├── App.jsx                             # Navigation & page router
│       ├── index.css                           # Cyber SOC dark theme
│       ├── api/client.js                       # Typed API client
│       ├── components/                         # Reusable UI components (Sidebar, Topbar)
│       └── pages/                              # 8 Dedicated analytical views
├── powerbi/                                    # Power BI Desktop Integration Assets
│   ├── README.md                               # 5-page report construction guide
│   ├── PowerQuery_M_Templates.pq               # Complete M queries (API + CSV fallback)
│   ├── DAX_Measures.dax                        # Enterprise DAX measure library
│   └── Schema_Diagram.md                       # Relational star schema diagram
├── exports/                                    # 10 Curated Power BI-Ready CSV Tables
│   ├── AttackDistribution.csv
│   ├── ProtocolDistribution.csv
│   ├── ServiceDistribution.csv
│   ├── FeatureSummary.csv
│   ├── HypothesisTestResults.csv
│   ├── CorrelationResults.csv
│   ├── ModelMetrics.csv
│   ├── ConfusionMatrix.csv
│   ├── FeatureImportance.csv
│   └── iot_pulse_clean_flows.csv
└── docs/                                       # Technical Documentation
    ├── ARCHITECTURE.md                         # Architecture diagrams & sequence flows
    └── METHODOLOGY.md                          # Inferential statistics & ML methodology
```
