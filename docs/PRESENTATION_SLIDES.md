# IoT PULSE — 12-Slide Presentation Deck Transcript & Speaker Guide
**Project:** IoT PULSE — From Traffic to Threats  
**Course:** 23CSE351 — Foundations of Data Science  
**File Generated:** [`IoT_PULSE_Presentation_12_Slides.pptx`](file:///Users/potlurubhavithmadhu/Desktop/fods/IoT_PULSE_Presentation_12_Slides.pptx) (72 KB, 16:9 Widescreen)  
**Recommended Timing:** 8–10 Minutes  

---

## Slide 1: Title & Cover Slide
* **Category:** FOUNDATIONS OF DATA SCIENCE (23CSE351) — FINAL CASE STUDY
* **Title:** **IoT PULSE: From Traffic to Threats**
* **Subtitle:** Uncovering Statistical Patterns of Normal & Malicious IoT Network Behaviour
* **Overview:** An end-to-end empirical investigation analyzing 123,117 real-time network flows with non-parametric inference, multiclass machine learning, and interactive 3D telemetry visualization.
* **Metadata:** Presenter: Bhavith Madhu (IoT PULSE Team) | Dataset: RT-IOT2022 | Architecture: FastAPI + DuckDB + React/Three.js + Power BI
* **Speaker Notes:**
  > *"Welcome professors and evaluation panel. Today, we present IoT PULSE: From Traffic to Threats. Our objective was to move beyond textbook descriptive analytics and build a rigorous empirical data science case study on the RT-IOT2022 dataset—combining non-parametric hypothesis testing, multiple comparison corrections, balanced machine learning, and an enterprise 3D cybersecurity dashboard."*

---

## Slide 2: Problem Statement & Strategic Objectives
* **Category:** EXECUTIVE CONTEXT
* **Title:** **Problem Statement & Strategic Objectives**
* **Left Card (The Problem):**
  - **Explosion of Vulnerable IoT Nodes:** Over 14 billion smart sensors often deploy default credentials, unencrypted telemetry, and unpatched firmware.
  - **Asymmetric Traffic Reality:** Attack flows (e.g. automated SYN floods, port scans) dwarf normal sensor heartbeats by orders of magnitude.
  - **Naive Data Science Failure:** Treating network flows with Gaussian assumptions or unweighted accuracy yields dangerously biased models.
* **Right Card (The Objectives):**
  - **1. Empirical Data Audit:** Clean 123,117 bidirectional flows, diagnose 3,380:1 class imbalance, audit 84 features.
  - **2. 15 Research Questions:** Formulate formal null/alternative hypotheses covering protocols, services, duration, ratios, and flags.
  - **3. Methodological Rigour:** Apply non-parametric tests (Kruskal-Wallis, Mann-Whitney, Spearman rho) and control FDR via Benjamini-Hochberg.
  - **4. Supervised ML Benchmark:** Train a cost-sensitive Random Forest with leakage-prevention to evaluate true multi-class separability.
  - **5. Full-Stack BI Delivery:** Deploy in-memory DuckDB engine, 3D WebGL dashboard, and 5-page Power BI / Tableau report.
* **Speaker Notes:**
  > *"Here we articulate the core problem. The Internet of Things introduces vast asymmetry: smart devices send small periodic updates, while adversaries bombard networks with thousands of packets per second. Our objective was fivefold: perform transparent data cleaning, answer 15 research questions with formal hypotheses, apply strict multiple-testing corrections, benchmark Random Forest with class-aware weights, and deliver enterprise visualizations."*

---

## Slide 3: Dataset Provenance & Experimental Topology
* **Category:** DATA ENGINEERING
* **Title:** **Dataset Provenance & Experimental Topology**
* **Top KPI Ribbon:**
  - `123,117` Total Flow Records (Bidirectional Zeek Flows)
  - `84` Cleaned Features (Temporal, volumetric & flags)
  - `12` Distinct Classes (3 Normal IoT, 9 Malicious Attacks)
  - `RT-IOT2022` Benchmark Testbed (Captured by Zeek & Argus)
* **Left Card (Physical & Virtual Topology):**
  - **Wipro Smart LED Bulb:** Generates real-time WiFi smart-home actuation events.
  - **ThingSpeak Weather Station:** Sends periodic telemetry updates (Temperature, Humidity) over HTTP/REST.
  - **MQTT Broker (Mosquitto):** Subscribes and publishes lightweight IoT broker telemetry payloads.
  - **Zeek Network Security Monitor:** Extracts bidirectional session flow state, timing intervals, and TCP flag histograms.
* **Right Card (Attack Emulation Vectors):**
  - **Denial of Service (DoS):** Hping3 SYN floods and Slowloris HTTP keep-alive exhaustion.
  - **Distributed DoS (DDoS):** Coordinated volumetric floods from distributed attack nodes.
  - **Active Reconnaissance:** Nmap sweeps (OS fingerprinting, SYN stealth, FIN scan, XMAS tree scan).
  - **Man-in-the-Middle (MitM):** ARP poisoning targeting local subnet gateway interfaces.
  - **Service Exploitation:** Metasploit payloads and SSH dictionary brute-force intrusions.
* **Speaker Notes:**
  > *"The RT-IOT2022 dataset captures realistic smart-home IoT devices paired with real-world attacks. Notice our 4 baseline metrics: 123,117 flow records across 84 features, grouped into 12 classes. Normal operations comprise real Wipro smart bulbs, ThingSpeak sensors, and MQTT brokers. Attacks include Hping3, Slowloris, ARP poisoning, and Nmap reconnaissance."*

---

## Slide 4: Data Preprocessing Choices & Quality Audit
* **Category:** DATA HYGIENE & VALIDATION
* **Title:** **Data Preprocessing Choices & Quality Audit**
* **Column 1 (Integrity Audit):**
  - **Missing Values: 0** — All 123,117 rows have complete network readings across 84 attributes.
  - **Full Duplicate Rows: 0** — No identical duplicate rows existed in the raw dataset.
  - **Feature Repeats: 1,180** — Records shared identical feature tuples across different labels; retained to reflect genuine packet bursts.
* **Column 2 (Preprocessing Choices):**
  - **Index Column Removal:** The raw column `Unnamed: 0` was an export artifact carrying no network measurement, and was immediately dropped.
  - **Whitespace Normalization:** All headers and categorical labels stripped of whitespace.
  - **Data Type Conversion:** Object columns parsed as numeric if $\ge 98\%$ parsed successfully.
* **Column 3 (Leakage & Outliers):**
  - **Port Number Dropping:** Port fields (`id.orig_p`, `id.resp_p`) removed from ML to prevent memorizing attack port signatures.
  - **Tukey 1.5x IQR Fencing:** Identified high outlier rates in packet rate (53.3%) and payload bytes (28.4%).
  - **Non-Destructive Policy:** Outliers reflect genuine volumetric spikes and were preserved.
* **Speaker Notes:**
  > *"Data hygiene was our first priority. We confirmed zero missing values across all 84 columns. Importantly, we dropped 'Unnamed: 0' so row indices wouldn't contaminate the analysis. We also removed port numbers before training our model to prevent artificial label leakage. Outliers were audited via Tukey's 1.5x IQR fence, but preserved because high packet rates are genuine attack signatures."*

---

## Slide 5: Exploratory Data Analysis: Class Imbalance & Skewness
* **Category:** EMPIRICAL BASELINE
* **Title:** **Exploratory Data Analysis: Class Imbalance & Skewness**
* **Top KPI Ribbon:**
  - `89.84%` Malicious Traffic Share (110,610 attack flows)
  - `10.16%` Normal Traffic Share (12,507 benign device flows)
  - `3,380 : 1` Extreme Imbalance Ratio (DOS_SYN_Hping vs NMAP_FIN)
  - `89.69%` TCP Protocol Dominance (110,427 TCP sessions)
* **Left Card (Class Distribution Table):**
  - `DOS_SYN_Hping`: 94,659 (76.89%) — Malicious SYN Flood
  - `Thing_Speak`: 8,108 (6.59%) — Normal Sensor Telemetry
  - `ARP_poisioning`: 7,750 (6.30%) — Malicious MitM Spoofing
  - `MQTT_Publish`: 4,146 (3.37%) — Normal Broker Messages
  - `NMAP_UDP_SCAN`: 2,590 (2.10%) — Malicious Port Sweep
  - `NMAP_XMAS_TREE`: 2,010 (1.63%) — Malicious Reconnaissance
  - `Wipro_bulb`: 253 (0.21%) — Normal Smart Lighting
  - `NMAP_FIN_SCAN`: 28 (0.02%) — Malicious Minority Label
* **Right Card (Statistical & Model Implications):**
  - **Accuracy Paradox:** Naive majority prediction yields 76.89% accuracy while missing all normal devices.
  - **Non-Gaussian Distributions:** Flow durations and byte rates exhibit severe right-skewness and zero-inflation.
  - **Rank-Based Necessity:** All hypothesis tests require non-parametric rank statistics.
* **Speaker Notes:**
  > *"Our exploratory analysis uncovered an extreme 3,380-to-1 class imbalance ratio. DOS_SYN_Hping accounts for nearly 77% of all records, while NMAP_FIN_SCAN accounts for only 28 flows (0.02%). This is crucial: standard accuracy is completely deceptive here. Furthermore, telemetry distributions are heavily skewed, confirming that parametric Gaussian assumptions would produce invalid inferences."*

---

## Slide 6: Hypothesis Testing Battery: 15 Research Questions
* **Category:** INFERENTIAL STATISTICS
* **Title:** **Hypothesis Testing Battery: 15 Research Questions**
* **Inferential Evidence Matrix:**
  - **Q2 Protocol Association:** Pearson Chi-Square ($\chi^2 = 83,803.12$, $p < 0.0001$, Cramér's $V = 0.5834$)
  - **Q3 Service Association:** Pearson Chi-Square ($\chi^2 = 301,729.10$, $p < 0.0001$, Cramér's $V = 0.6391$)
  - **Q4 Duration Across Labels:** Kruskal-Wallis ($H = 44,749.48$, $p < 0.0001$, $\eta^2 = 0.3635$)
  - **Q5 Packets Across Labels:** Kruskal-Wallis ($H = 59,302.94$, $p < 0.0001$, $\eta^2 = 0.4817$)
  - **Q6 Fwd vs Bwd Packets:** Spearman Rank ($\rho = 0.7463$, $t = 394.04$, $p < 0.0001$)
  - **Q7 TCP vs UDP Pkt Rate:** Mann-Whitney $U$ ($U = 1.208 \times 10^9$, $p < 0.0001$, $r = 0.7314$)
  - **Q8 TCP vs UDP Payload:** Mann-Whitney $U$ ($U = 1.159 \times 10^9$, $p < 0.0001$, $r = 0.6622$)
  - **Q9 SYN Flags Across Labels:** Kruskal-Wallis ($H = 57,883.20$, $p < 0.0001$, $\eta^2 = 0.4702$)
  - **Q10 High-SYN Proportion:** Two-Proportion $z$ ($z = -196.1240$, $p < 0.0001$, 95% CI $[-0.377, -0.366]$)
  - **Q11 Duration vs Pkt Rate:** Spearman Rank ($\rho = -0.2959$, $t = -108.06$, $p < 0.0001$)
  - **Q14 MQTT vs Non-MQTT Duration:** Mann-Whitney $U$ ($U = 4.883 \times 10^8$, $p < 0.0001$, $r = 0.9864$)
* **Key Finding:** 11 of 11 inferential tests reject $H_0$ with Benjamini-Hochberg adjusted $p < 0.0001$ (100% survival rate).
* **Speaker Notes:**
  > *"This slide presents the core statistical rigor of our project. Across the 15 research questions, we conducted 11 formal inferential tests spanning Pearson Chi-Square, Kruskal-Wallis, Mann-Whitney U, and Spearman correlation. To avoid the multiple comparisons fallacy, we applied the Benjamini-Hochberg False Discovery Rate correction at alpha = 0.05. All 11 tests maintained adjusted p-values below 0.0001. We report both test statistics and standardized effect sizes."*

---

## Slide 7: Critical Analytical Anomaly: The High-SYN Paradox (Q10)
* **Category:** DEEP DOMAIN INSIGHT
* **Title:** **Critical Analytical Anomaly: The High-SYN Paradox (Q10)**
* **Left Card (Empirical Evidence):**
  - **Hypothesis:** $H_0$: Proportion of high-SYN flows ($\text{fwd\_SYN} > 1$) is equal between DOS_SYN_Hping and other traffic.
  - **DOS_SYN_Hping Share:** **0.00%** (0 of 94,659 flows).
  - **Other Network Traffic Share:** **37.15%** (10,571 of 28,458 flows).
  - **Test Metric:** $z = -196.1240$, $p < 0.0001$, 95% Wald CI: $[-0.3771, -0.3658]$.
  - **The Question:** Why does a SYN Flood attack have ZERO high-SYN flow records?
* **Right Card (Network Protocol & Zeek Reasoning):**
  - **1. Single-Packet Spoofing:** Hping3 crafts single-packet SYN requests with randomized source IP addresses.
  - **2. Zeek Flow Aggregation:** Because each spoofed SYN arrives from a unique pseudo-random port/IP without response, Zeek logs each attempt as an isolated 1-packet flow.
  - **3. Why Benign Flows Have High SYNs:** Legitimate IoT connections (MQTT retries, ThingSpeak reconnects) experience wireless packet loss and re-transmit SYN packets within the same continuous TCP session.
  - **4. Detection Takeaway:** Filtering on "high SYN packets per flow" will completely miss Hping3 SYN floods!
* **Speaker Notes:**
  > *"Question 10 revealed one of the most critical domain insights in this case study: The High-SYN Paradox. Intuition suggests a SYN flood would have thousands of SYN flags per flow. But our statistical test returned z = -196.12, revealing that DOS_SYN_Hping had 0.00% high-SYN flows. Why? Because Hping3 spoofs source addresses, sending single-packet SYNs. Zeek records each as an isolated single-packet flow. Meanwhile, normal IoT connections that retransmit have higher SYN counts. This proves why statistical data science is essential for cybersecurity detection engineering."*

---

## Slide 8: Supervised Machine Learning: Random Forest Benchmark
* **Category:** MODEL EVALUATION & BENCHMARKING
* **Title:** **Supervised Machine Learning: Random Forest Benchmark**
* **Top KPI Ribbon:**
  - `0.9338` Random Forest Macro-F1 (Balanced across all 12 classes)
  - `0.0724` Majority Baseline F1 (Class imbalance floor)
  - `+0.8614` Macro-F1 Model Lift (True empirical improvement)
  - `0.9380` Balanced Accuracy (vs 0.0833 baseline)
* **Left Card (Configuration & Validation):**
  - **Algorithm Choice:** Random Forest (100 estimators, max_depth=20, random_state=42).
  - **Class-Weight Adjustment:** `class_weight='balanced_subsample'` recalculates tree weights per bootstrap sample.
  - **Leakage Protection:** Port numbers strictly excluded prior to training.
  - **Validation Strategy:** Stratified 80/20 train/test split preserving minority class proportions.
* **Right Card (Top Predictive Features):**
  - `fwd_URG_flag_count` (0.0418) — Identifies XMAS scans and abnormal control packets.
  - `fwd_last_window_size` (0.0406) — Distinguishes TCP buffer management across tools.
  - `fwd_PSH_flag_count` (0.0390) — Differentiates push-data flows (MQTT) from scans.
  - `fwd_header_size_tot` (0.0331) — Separates single-packet floods from real payloads.
  - `fwd_pkts_payload.avg` (0.0326) — Highlights sensor data payloads vs zero-byte scans.
* **Speaker Notes:**
  > *"To satisfy the machine learning requirement, we trained a cost-sensitive Random Forest classifier. Because our dataset is imbalanced, accuracy is meaningless. We report Macro-F1 score: our model achieves 0.9338 compared to the majority-class baseline of 0.0724, demonstrating an empirical lift of +0.8614. Top predictive features include urgent flag counts, TCP window sizes, and push flag counts—directly reflecting the protocol mechanics."*

---

## Slide 9: Full-Stack Platform: In-Memory DuckDB & 3D SOC
* **Category:** SOFTWARE & SYSTEMS ARCHITECTURE
* **Title:** **Full-Stack Platform: In-Memory DuckDB & 3D SOC**
* **4-Column Architecture:**
  - **1. IN-MEMORY ENGINE:** DuckDB Columnar OLAP — All 123,117 rows in memory; sub-15ms SQL aggregations.
  - **2. BACKEND API:** FastAPI + Python 3.9 — 15+ REST endpoints; Pydantic response validation; dynamic CSV export router.
  - **3. 3D WEB PLATFORM:** React + Three.js + R3F — Interactive 3D Network Globe; spatial clustering; tactical HUD cockpit.
  - **4. QUALITY AUDIT:** Pytest Test Suite — 17 / 17 automated tests passing; production Vite build in 2.08s.
* **Speaker Notes:**
  > *"We elevated this project from a static notebook into an enterprise-grade full-stack platform. The architecture combines an in-memory DuckDB columnar engine executing SQL queries over 123k records in under 15 milliseconds, a FastAPI REST service, an interactive 3D WebGL network globe built with React and Three.js, and a 100% passing test suite of 17 automated Pytest unit tests."*

---

## Slide 10: Business Intelligence: Power BI & Tableau Implementation
* **Category:** ENTERPRISE BI DELIVERABLES
* **Title:** **Business Intelligence: Power BI & Tableau Implementation**
* **Top KPI Ribbon:**
  - `5 Pages` Power BI Report Structure (Executive to Data Audit)
  - `170+ Lines` DAX Measures Library (Pre-computed Analytical DAX)
  - `10 Tables` Curated Export CSVs (Pre-aggregated BI Dimensions)
  - `Dual-Mode` Connection Architecture (Live API + Offline CSV)
* **Left Card (Power BI Desktop Specifications):**
  - **Page 1: Executive Overview:** Macro traffic gauge (89.8% malicious), attack donut, and TCP dominance.
  - **Page 2: Attack Flow Profiles:** Flow duration bar chart and bidirectional packet scatter plots.
  - **Page 3: Statistical Hypotheses:** Matrix of 11 hypothesis tests with FDR significance indicators.
  - **Page 4: Model Evaluation:** 12x12 confusion matrix heatmap and top 20 Gini feature bars.
  - **Page 5: Quality & Caveats:** Missing value audit (0 missing) and observational study disclosures.
* **Right Card (BI Integration Architecture):**
  - **Power Query M Integration:** `PowerQuery_M_Templates.pq` enables live refresh via FastAPI endpoints.
  - **Star-Schema Modeling:** Fact table `Flows` connected via 1-to-many relationships to dimension tables.
  - **One-Click Web Export:** Dashboard includes 'Export Curated CSV' button for immediate BI ingestion.
  - **Native macOS Tableau Workbook:** Includes `IoT_PULSE_Cybersecurity_Analytics.twb` for native macOS demonstration.
* **Speaker Notes:**
  > *"To satisfy the Business Intelligence requirement, we constructed comprehensive Power BI and Tableau deliverables. We modeled a star schema connecting 10 curated export tables, wrote 170+ lines of enterprise DAX measures, and designed a 5-page Power BI dashboard. It supports live dynamic API refresh via Power Query M as well as offline CSV ingestion. A native Tableau workbook is also provided for cross-platform macOS demonstration."*

---

## Slide 11: Research Limitations & Observational Caveats
* **Category:** ACADEMIC RIGOUR & HONESTY
* **Title:** **Research Limitations & Observational Caveats**
* **Card 1: Observational Study (Not Randomized A/B):** Group comparisons (TCP vs UDP, MQTT vs Non-MQTT) do not feature randomized assignment to treatment and control. Statistical associations must not be interpreted as causal relationships.
* **Card 2: Lab Testbed Generalization Limits:** Data was captured in an emulated IoT testbed. Models may not generalize identically to unseen zero-days, production networks, or unrepresented IoT devices.
* **Card 3: Statistical Flow Dependence & Clustering:** Network flows generated in bursts exhibit temporal and device-level autocorrelation, which can understate inferential uncertainty.
* **Card 4: Aggregated Flow Logging (Zeek vs Packets):** Zeek logs aggregate flow statistics over session intervals rather than raw packet arrival timestamps, restricting fine-grained sequence modeling.
* **Speaker Notes:**
  > *"A hallmark of sound data science is intellectual honesty about limitations. First, we explicitly state that protocol comparisons are observational, not randomized A/B experiments. Second, our model reflects offline testbed separability and may not generalize to unseen enterprise networks. Third, network flow bursts exhibit clustering, which can understate inferential uncertainty. Acknowledging these constraints demonstrates mature academic practice."*

---

## Slide 12: Evidence-Based Conclusions & Future Roadmap
* **Category:** PROJECT SYNTHESIS & IMPACT
* **Title:** **Evidence-Based Conclusions & Future Roadmap**
* **Left Card (Core Evidence-Based Conclusions):**
  - **1. Temporal & Volumetric Fingerprints:** Normal IoT devices maintain long-lived sessions (median MQTT $\sim 44$s) with small bidirectional payloads. Attacks exhibit millisecond durations with unidirectional flooding.
  - **2. The Myth of the Gaussian Assumption:** Extreme right-skewness and zero-inflation confirmed that non-parametric methods are mandatory for network telemetry.
  - **3. Statistical Survival Under FDR:** All 11 inferential hypotheses maintained significance under Benjamini-Hochberg adjustment ($p_{\text{adj}} < 0.0001$).
  - **4. Machine Learning Viability:** Cost-sensitive Random Forest achieved Macro-F1 = 0.9338, confirming high multiclass discriminative power.
* **Right Card (Future Enhancements Roadmap):**
  - **Cross-Dataset Validation:** Test the pre-trained model on independent benchmarks (e.g. BoT-IoT, TON_IoT).
  - **Deep Sequential Architectures:** Implement Temporal Convolutional Networks (TCN) and Transformers for raw packet sequences.
  - **Live Inline SOC Sniffing:** Integrate live libpcap packet capture streaming into the DuckDB engine for real-time edge detection.
  - **Zero-Day Anomaly Detection:** Incorporate unsupervised autoencoders and Isolation Forests to flag zero-day attacks.
* **Speaker Notes:**
  > *"In conclusion, IoT PULSE demonstrates that statistical data science and domain knowledge must go hand in hand. Normal smart sensors exhibit persistent bidirectional dialogues, while attacks exhibit rapid, asymmetric bursts. By applying non-parametric inference, False Discovery Rate control, and cost-sensitive ensemble modeling, we successfully uncovered the statistical patterns separating normal traffic from threats. Thank you, and we now welcome any questions from the panel."*
