# IoT PULSE — Case Study Comprehensive Documentation
**Project Title:** IoT PULSE: From Traffic to Threats — Uncovering Statistical Patterns of Normal and Malicious IoT Network Behaviour  
**Course:** 23CSE351 — Foundations of Data Science  
**Author / Team:** Bhavith Madhu (IoT PULSE Research Team)  
**Academic Term:** October 2026  
**Repository:** [https://github.com/BhavithMadhu/IoT-PULSE](https://github.com/BhavithMadhu/IoT-PULSE)  
**Dataset:** RT-IOT2022 Benchmark Dataset  

---

## Executive Summary

The Internet of Things (IoT) ecosystem connects over 14 billion resource-constrained smart devices operating within residential, industrial, and healthcare environments. Unlike traditional IT infrastructure, IoT deployments often lack host-based security agents, rely on unencrypted telemetry protocols (e.g., MQTT, HTTP REST), and operate with low compute headroom. This makes IoT nodes prime targets for automated botnets, volumetric Denial-of-Service (DoS) floods, and active network reconnaissance.

**IoT PULSE** is an end-to-end empirical data science case study that investigates 123,117 bidirectional network flow records from the **RT-IOT2022** benchmark dataset. Moving beyond descriptive summaries, this study:
1. Conducts a rigorous data-hygiene audit (resolving missing values, duplicates, and target leakage).
2. Analyzes severe class imbalance (a 3,380:1 majority-to-minority ratio).
3. Evaluates 15 structured research questions using non-parametric inferential statistics (Pearson's $\chi^2$, Kruskal–Wallis $H$, Mann–Whitney $U$, Spearman $\rho$, and two-proportion $z$-tests).
4. Controls the False Discovery Rate (FDR) using the Benjamini–Hochberg procedure across all inferential tests.
5. Diagnoses a counter-intuitive network anomaly (the High-SYN Paradox in Question 10).
6. Benchmarks a cost-sensitive Random Forest classifier using class-aware weighting (`balanced_subsample`), achieving a **Macro-F1 score of 0.9338** (an empirical lift of **+0.8614** over the majority-class baseline of 0.0724).
7. Deploys the findings into a full-stack architecture featuring an in-memory DuckDB analytical engine, a 3D WebGL Security Operations Center (SOC) dashboard, and an enterprise 5-page Power BI / Tableau business intelligence suite.

---

## 1. Problem Statement & Research Objectives

### 1.1 The IoT Cybersecurity Challenge
Modern IoT botnets (such as Mirai and its derivatives) exploit smart-home devices to mount distributed volumetric attacks. Defending these networks requires automated intrusion detection systems (IDS). However, applying machine learning and statistical modeling to network traffic involves substantial methodological traps:
* **The Accuracy Paradox:** Because benign IoT telemetry is heavily outnumbered by automated attack traffic during an incident, an unweighted classifier predicting purely the majority attack class can attain >75% accuracy while completely failing to detect legitimate smart-home operations or stealthy reconnaissance sweeps.
* **Violation of Gaussian Assumptions:** Network metrics such as packet rates, inter-arrival times, and payload sizes exhibit extreme right-skewness and zero-inflation, rendering standard parametric tests (e.g., Student's $t$-test, ANOVA) mathematically invalid.
* **Target Leakage:** Including network port numbers (`id.orig_p`, `id.resp_p`) in feature matrices allows models to cheat by memorizing lab-specific port bindings rather than learning genuine protocol behavior.

### 1.2 Core Research Objectives
1. **Data Preprocessing & Integrity:** Standardize and clean the RT-IOT2022 dataset without introducing synthetic distortions or data leakage.
2. **Exploratory Data Analysis (EDA):** Characterize class distributions, protocol composition, and baseline traffic metrics.
3. **Structured Hypothesis Testing:** Formulate and test formal null/alternative hypotheses for 15 research questions, reporting exact test statistics, degrees of freedom, sample sizes, and standardized effect sizes.
4. **Multiple Testing Correction:** Apply Benjamini–Hochberg FDR adjustments to avoid Type I family-wise error inflation.
5. **Domain Anomaly Investigation:** Mechanically explain counter-intuitive empirical observations (specifically why Hping3 SYN floods exhibit zero high-SYN flow records).
6. **Class-Aware Machine Learning:** Implement and benchmark a cost-sensitive classifier evaluated against a strict majority baseline.
7. **Full-Stack Visualization Delivery:** Deliver an interactive 3D WebGL dashboard and enterprise Power BI reporting assets.

---

## 2. Dataset Architecture & Device Topology

### 2.1 Benchmark Attribution & Provenance
The analysis utilizes the **RT-IOT2022** dataset, an empirical IoT cybersecurity benchmark collected in a dedicated physical-virtual testbed environment. Network telemetry was captured using the **Zeek (formerly Bro)** Network Security Monitor and the **Argus** flow monitor.

* **Total Records:** 123,117 bidirectional network flow sessions.
* **Raw Columns:** 85 attributes.
* **Cleaned Features:** 84 attributes (after dropping the uninformative index column).
* **Target Variable:** `Attack_type` (12 distinct categories: 3 normal IoT devices, 9 malicious attacks).

### 2.2 Testbed Device Topology
| Device / Node | Type | Communication Protocol | Function in Dataset |
| :--- | :--- | :--- | :--- |
| **Wipro Smart LED Bulb** | Physical IoT Appliance | Wi-Fi (802.11 b/g/n) | Smart lighting actuation and state polling. |
| **ThingSpeak Station** | Physical Microcontroller | HTTP / REST API | Periodic temperature and humidity telemetry. |
| **Mosquitto MQTT Broker** | IoT Broker Node | TCP / MQTT (Port 1883) | Publish/subscribe message broker for telemetry. |
| **Attack Simulation Host** | Linux Attack Workstation | Raw Sockets / Scapy / Kali | Executing Hping3, Nmap, Slowloris, and Brute-Force attacks. |

### 2.3 Attack Emulation Profiles
1. **DOS_SYN_Hping (94,659 flows):** Single-packet SYN flooding utilizing randomized source IP spoofing.
2. **ARP_poisioning (7,750 flows):** Gratuitous ARP response spoofing to hijack local gateway traffic.
3. **NMAP_UDP_SCAN (2,590 flows):** Automated UDP port probing across the service spectrum.
4. **NMAP_XMAS_TREE_SCAN (2,010 flows):** TCP packets with FIN, URG, and PSH flags set simultaneously to bypass stateful filters.
5. **NMAP_OS_DETECTION (2,000 flows):** Probing TCP/IP stack options to fingerprint target operating systems.
6. **NMAP_TCP_SCAN (1,002 flows):** Standard full-connect TCP port reconnaissance.
7. **DDOS_Slowloris (534 flows):** Application-layer HTTP exhaustion via incomplete request headers.
8. **Metasploit_Brute_Force_SSH (37 flows):** Dictionary attack targeting SSH daemon credentials.
9. **NMAP_FIN_SCAN (28 flows):** Stealth scan transmitting TCP FIN packets to closed ports.

---

## 3. Data Preprocessing & Quality Audit

### 3.1 Preprocessing Decisions
1. **Index-Like Column Removal:** The raw dataset included an uninformative first column (`Unnamed: 0`), representing row offsets from CSV export. This column was removed to prevent models from treating row sequence as a network measurement.
2. **Whitespace Normalization:** All 85 column headers and string categorical values were stripped of leading/trailing whitespace.
3. **Strict Type Conversion:** Object columns were evaluated; columns where $\ge 98\%$ of values successfully parsed as numeric were converted to 64-bit floating point, with corrupted entries converted to `NaN`.
4. **Target Variable Sanitization:** The `Attack_type` column was stripped and validated; records missing labels were purged (0 records affected).

### 3.2 Data Integrity Audit Results
* **Missing Values Audit:** Exactly **0 missing values** across all 123,117 rows and 84 cleaned attributes.
* **Full Duplicate Rows:** Exactly **0 full duplicate rows**.
* **Repeated Feature Signatures:** **1,180 records** shared identical 83-feature tuples across different labels. These records were retained because legitimate IoT sensors and automated scanners transmit identical packet headers across rapid successive intervals; purging them would eliminate genuine telemetry bursts.
* **Target Leakage Prevention:** Network port numbers (`id.orig_p` and `id.resp_p`) were excluded from machine learning feature matrices to prevent models from memorizing testbed port bindings.

### 3.3 Outlier Diagnostics (Tukey's $1.5 \times \text{IQR}$ Fence)
Continuous features were audited for outliers using the interquartile range formula:
$$\text{Lower Fence} = Q_1 - 1.5 \times \text{IQR}, \quad \text{Upper Fence} = Q_3 + 1.5 \times \text{IQR}$$

* High outlier concentrations were identified in:
  - `flow_pkts_per_sec`: 53.30% outlier rate.
  - `fwd_pkts_per_sec`: 53.11% outlier rate.
  - `bwd_bytes_tot`: 30.22% outlier rate.
* **Policy Decision:** Outliers were **preserved without truncation or clipping**. In cybersecurity analytics, extreme packet rates and large byte bursts represent genuine volumetric attack signatures (e.g., DoS floods). Truncating outliers would remove the very signal required to detect malicious behavior.

---

## 4. Exploratory Data Analysis & Class Balance

### 4.1 Class Distribution & Imbalance
The RT-IOT2022 dataset displays severe class imbalance across its 12 classes:

| Class Label | Traffic Nature | Record Count | Percentage | Class Category |
| :--- | :--- | :---: | :---: | :--- |
| **DOS_SYN_Hping** | Malicious | 94,659 | 76.885% | Volumetric Denial of Service |
| **Thing_Speak** | Normal | 8,108 | 6.586% | Smart Home Sensor Telemetry |
| **ARP_poisioning** | Malicious | 7,750 | 6.295% | Man-in-the-Middle Spoofing |
| **MQTT_Publish** | Normal | 4,146 | 3.368% | Smart Broker Messaging |
| **NMAP_UDP_SCAN** | Malicious | 2,590 | 2.104% | Network Reconnaissance |
| **NMAP_XMAS_TREE_SCAN** | Malicious | 2,010 | 1.633% | Stealth Reconnaissance |
| **NMAP_OS_DETECTION** | Malicious | 2,000 | 1.624% | Operating System Fingerprinting |
| **NMAP_TCP_SCAN** | Malicious | 1,002 | 0.814% | Active Port Scanning |
| **DDOS_Slowloris** | Malicious | 534 | 0.434% | Application-Layer HTTP Flood |
| **Wipro_bulb** | Normal | 253 | 0.205% | Smart Lighting Actuation |
| **Metasploit_Brute_Force_SSH**| Malicious | 37 | 0.030% | Credential Exploitation |
| **NMAP_FIN_SCAN** | Malicious | 28 | 0.023% | Stealth Reconnaissance |

* **Macro Composition:**
  - **Malicious Attacks:** 110,610 flows (**89.841%**)
  - **Normal IoT Telemetry:** 12,507 flows (**10.159%**)
* **Majority-to-Minority Imbalance Ratio:**
  $$\text{Imbalance Ratio} = \frac{94,659}{28} \approx 3,380.68 : 1$$

### 4.2 Protocol and Service Distribution
* **Protocol Composition:**
  - **TCP:** 110,427 flows (**89.693%**) — Driven primarily by SYN floods and HTTP/MQTT sessions.
  - **UDP:** 12,519 flows (**10.168%**) — Port sweeps and DNS inquiries.
  - **ICMP:** 171 flows (**0.139%**) — Network diagnostic sweeps.
* **Service Composition:**
  - **None / Raw IP (`-`):** 110,517 flows (**89.766%**) — Reflecting raw port probes and spoofed packets that never establish an application handshake.
  - **MQTT:** 4,204 flows (**3.415%**) — Normal smart-home publish/subscribe traffic.
  - **HTTP:** 662 flows (**0.538%**) — Sensor dashboards and Slowloris target connections.
  - **DNS:** 561 flows (**0.456%**) — Name resolution inquiries.

---

## 5. Statistical Hypotheses & 15 Research Questions

Across the 15 research questions, 11 formal inferential tests were executed. Because 11 concurrent hypotheses were evaluated, the **Benjamini–Hochberg False Discovery Rate (FDR)** procedure was applied at $\alpha = 0.05$:
$$P_{(i)} \le \frac{i}{m} \times Q$$
Where $m = 11$, $Q = 0.05$, and $i$ is the ascending rank of the raw $p$-value.

### Consolidated Inferential Test Results Table

| Question / Topic | Statistical Method | Test Statistic | Raw $p$-value | Adjusted $p$-value (BH) | Effect Size / Interval | Statistical Decision |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| **Q2 Protocol Association** | Pearson's $\chi^2$ ($\text{df}=22$) | $\chi^2 = 83,803.125$ | $< 0.0001$ | $< 0.0001$ | Cramér's $V = 0.5834$ | **Reject $H_0$** |
| **Q3 Service Association** | Pearson's $\chi^2$ ($\text{df}=66$) | $\chi^2 = 301,729.097$| $< 0.0001$ | $< 0.0001$ | Cramér's $V = 0.6391$ | **Reject $H_0$** |
| **Q4 Flow Duration Across Labels**| Kruskal–Wallis $H$ ($k=11$) | $H = 44,749.478$ | $< 0.0001$ | $< 0.0001$ | $\eta^2[H] = 0.3635$ | **Reject $H_0$** |
| **Q5 Total Packets Across Labels**| Kruskal–Wallis $H$ ($k=11$) | $H = 59,302.945$ | $< 0.0001$ | $< 0.0001$ | $\eta^2[H] = 0.4817$ | **Reject $H_0$** |
| **Q6 Fwd vs Bwd Packets** | Spearman Rank Correlation | $\rho = 0.7463$ | $< 0.0001$ | $< 0.0001$ | $t = 394.04$ | **Reject $H_0$** |
| **Q7 TCP vs UDP Packet Rate** | Mann–Whitney $U$ | $U = 1.208 \times 10^9$ | $< 0.0001$ | $< 0.0001$ | Rank-Biserial $r = 0.7314$ | **Reject $H_0$** |
| **Q8 TCP vs UDP Payload Rate** | Mann–Whitney $U$ | $U = 1.159 \times 10^9$ | $< 0.0001$ | $< 0.0001$ | Rank-Biserial $r = 0.6622$ | **Reject $H_0$** |
| **Q9 SYN Flags Across Labels** | Kruskal–Wallis $H$ ($k=11$) | $H = 57,883.196$ | $< 0.0001$ | $< 0.0001$ | $\eta^2[H] = 0.4702$ | **Reject $H_0$** |
| **Q10 High-SYN Proportion** | Two-Proportion $z$-test | $z = -196.1240$ | $< 0.0001$ | $< 0.0001$ | 95% CI: $[-0.3771, -0.3658]$ | **Reject $H_0$** |
| **Q11 Duration vs Packet Rate**| Spearman Rank Correlation | $\rho = -0.2959$ | $< 0.0001$ | $< 0.0001$ | $t = -108.06$ | **Reject $H_0$** |
| **Q13 Down/Up Packet Ratio** | Kruskal–Wallis $H$ ($k=11$) | $H = 35,188.375$ | $< 0.0001$ | $< 0.0001$ | $\eta^2[H] = 0.2858$ | **Reject $H_0$** |
| **Q14 MQTT vs Non-MQTT Duration**| Mann–Whitney $U$ | $U = 4.883 \times 10^8$ | $< 0.0001$ | $< 0.0001$ | Rank-Biserial $r = 0.9864$ | **Reject $H_0$** |

*All 11 inferential tests maintained significance at $p_{\text{adj}} < 0.0001$ (100% survival rate).*

---

### Detailed Question-by-Question Analysis

#### Question 1: Class Imbalance & Threat Landscape
* **Research Question:** What is the degree of class imbalance between normal and attack traffic?
* **Method:** Descriptive frequency distribution and imbalance ratio calculation.
* **Finding:** Attack flows comprise 89.84% of records. The ratio between the majority attack (`DOS_SYN_Hping`, $n=94,659$) and the rarest scan (`NMAP_FIN_SCAN`, $n=28$) is $3,380.68:1$.
* **Implication:** Standard accuracy is completely invalid as an evaluation metric.

#### Question 2: Protocol Selection Across Attack Classes
* **Hypotheses:**
  - $H_0$: Network protocol usage is statistically independent of attack type.
  - $H_1$: Network protocol usage is significantly dependent on attack type.
* **Result:** $\chi^2 = 83,803.125$, $\text{df} = 22$, $p < 0.0001$, Cramér's $V = 0.5834$.
* **Decision:** Reject $H_0$. Strong association; DoS floods concentrate exclusively on TCP, whereas reconnaissance sweeps utilize UDP and ICMP.

#### Question 3: Application Service Stratification
* **Hypotheses:**
  - $H_0$: Application service category is independent of attack type.
  - $H_1$: Application service category is significantly dependent on attack type.
* **Result:** $\chi^2 = 301,729.097$, $\text{df} = 66$, $p < 0.0001$, Cramér's $V = 0.6391$.
* **Decision:** Reject $H_0$. Benign smart-home devices bind to specific application-layer daemons (`mqtt`, `http`), while 99.8% of flood flows never reach the application layer.

#### Question 4: Flow Duration Across Attack Categories
* **Hypotheses:**
  - $H_0$: Median flow duration is identical across all 12 traffic classes.
  - $H_1$: Median flow duration differs significantly across at least two classes.
* **Result:** Kruskal–Wallis $H = 44,749.478$, $\text{df} = 11$, $p < 0.0001$, $\eta^2[H] = 0.3635$.
* **Decision:** Reject $H_0$. Normal IoT flows exhibit persistent connections (MQTT median $\approx 32.06$ seconds), whereas automated port scans and SYN floods terminate within microseconds to milliseconds.

#### Question 5: Total Packet Volume Distribution
* **Hypotheses:**
  - $H_0$: Total packet volume distributions are identical across traffic classes.
  - $H_1$: Total packet volume distributions differ significantly across traffic classes.
* **Result:** Kruskal–Wallis $H = 59,302.945$, $\text{df} = 11$, $p < 0.0001$, $\eta^2[H] = 0.4817$.
* **Decision:** Reject $H_0$. Reconnaissance scans generate exactly 1 to 2 packets per flow, whereas DoS and benign streams transmit dense packet bursts.

#### Question 6: Bidirectional Packet Volume Symmetry
* **Hypotheses:**
  - $H_0$: Forward packet count and backward packet count are monotonically uncorrelated ($\rho = 0$).
  - $H_1$: Forward and backward packet counts exhibit a significant monotonic correlation ($\rho \ne 0$).
* **Result:** Spearman $\rho = 0.7463$, $t = 394.04$, $p < 0.0001$.
* **Decision:** Reject $H_0$. Strong positive correlation reflecting client-server request-response dynamics, though DoS attacks introduce severe unidirectional asymmetry.

#### Question 7: TCP vs. UDP Packet Transmission Intensity
* **Hypotheses:**
  - $H_0$: TCP and UDP flows have identical packet rate distributions.
  - $H_1$: TCP and UDP flows have significantly different packet rate distributions.
* **Result:** Mann–Whitney $U = 1.208 \times 10^9$, $p < 0.0001$, Rank-Biserial Correlation $r = 0.7314$.
* **Decision:** Reject $H_0$. TCP flows exhibit significantly higher packet transmission rates due to automated SYN flooding.

#### Question 8: TCP vs. UDP Payload Transmission Rates
* **Hypotheses:**
  - $H_0$: TCP and UDP flows exhibit identical payload byte rate distributions.
  - $H_1$: TCP and UDP flows exhibit significantly different payload byte rate distributions.
* **Result:** Mann–Whitney $U = 1.159 \times 10^9$, $p < 0.0001$, Rank-Biserial Correlation $r = 0.6622$.
* **Decision:** Reject $H_0$. TCP payload byte rates are substantially higher in legitimate sensor streams compared to zero-payload UDP scans.

#### Question 9: SYN Flag Counts Across Attack Categories
* **Hypotheses:**
  - $H_0$: Forward SYN flag counts are identically distributed across all attack categories.
  - $H_1$: Forward SYN flag counts differ significantly across categories.
* **Result:** Kruskal–Wallis $H = 57,883.196$, $\text{df} = 11$, $p < 0.0001$, $\eta^2[H] = 0.4702$.
* **Decision:** Reject $H_0$. Significant divergence across categories.

#### Question 10: The High-SYN Flood Anomaly (Deep Dive)
* **Hypotheses:**
  - $H_0$: The proportion of high-SYN flows ($\text{fwd\_SYN} > 1$) is equal between `DOS_SYN_Hping` and other network traffic ($p_1 = p_2$).
  - $H_1$: The proportions differ significantly ($p_1 \ne p_2$).
* **Result:** Two-proportion $z = -196.1240$, $p < 0.0001$.
  - Observed DOS_SYN_Hping high-SYN share: **0.00%** (0 of 94,659 flows).
  - Observed Other traffic high-SYN share: **37.15%** (10,571 of 28,458 flows).
  - 95% Wald Confidence Interval for $(p_1 - p_2)$: **$[-0.3771, -0.3658]$**.
* **Decision:** Reject $H_0$. Counter-intuitively, the SYN flood attack has **zero** high-SYN flows. (See Section 6 for domain explanation).

#### Question 11: Flow Duration vs. Packet Transmission Rate
* **Hypotheses:**
  - $H_0$: Flow duration and packet rate are uncorrelated ($\rho = 0$).
  - $H_1$: Flow duration and packet rate exhibit a significant monotonic correlation ($\rho \ne 0$).
* **Result:** Spearman $\rho = -0.2959$, $t = -108.06$, $p < 0.0001$.
* **Decision:** Reject $H_0$. Statistically significant negative correlation; short-duration burst attacks achieve massive instantaneous packet rates, whereas persistent connections maintain lower average rates.

#### Question 12: Multicollinearity in Network Timing Features
* **Method:** Pearson and Spearman correlation matrices across inter-arrival time (IAT) and flow duration features.
* **Finding:** Strong collinearity clusters detected between `flow_iat.tot`, `flow_duration`, and `fwd_iat.tot` ($r > 0.95$).
* **Implication:** Tree-based models are preferred over linear models because decision trees are invariant to feature collinearity.

#### Question 13: Downlink-to-Uplink Packet Ratio (`down_up_ratio`)
* **Hypotheses:**
  - $H_0$: Downlink/uplink packet ratios are identically distributed across classes.
  - $H_1$: Downlink/uplink packet ratios differ significantly across classes.
* **Result:** Kruskal–Wallis $H = 35,188.375$, $\text{df} = 11$, $p < 0.0001$, $\eta^2[H] = 0.2858$.
* **Decision:** Reject $H_0$. Normal IoT telemetry exhibits balanced request-response ratios ($\approx 1.0$), while spoofed attacks have ratios of 0.0.

#### Question 14: MQTT IoT Traffic vs. Non-MQTT Network Duration
* **Hypotheses:**
  - $H_0$: MQTT flows and non-MQTT flows have identical duration distributions.
  - $H_1$: MQTT flows have significantly different duration distributions.
* **Result:** Mann–Whitney $U = 4.883 \times 10^8$, $p < 0.0001$, Rank-Biserial Correlation $r = 0.9864$.
* **Decision:** Reject $H_0$. Near-perfect rank separation ($r \approx 0.99$); MQTT connections are long-lived persistent telemetry sessions.

#### Question 15: Machine Learning Multi-Class Separability
* **Evaluated:** Can a cost-sensitive classifier reliably separate normal IoT telemetry from 9 distinct attack categories?
* **Result:** Random Forest achieves **Macro-F1 = 0.9338** vs Majority Baseline = **0.0724** (+0.8614 lift).

---

## 6. Domain Anomaly: The High-SYN Paradox (Question 10)

One of the most critical contributions of this case study is resolving the **High-SYN Counter-Intuition**.

### The Paradox
Intuitive cybersecurity reasoning suggests that a Denial of Service attack named `DOS_SYN_Hping` should contain thousands of SYN packets per flow. However, our empirical test proved:
$$\text{Proportion}(\text{High-SYN} \mid \text{DOS\_SYN\_Hping}) = 0.00\% \quad (0 \text{ out of } 94,659 \text{ flows})$$
$$\text{Proportion}(\text{High-SYN} \mid \text{Other Traffic}) = 37.15\% \quad (10,571 \text{ out of } 28,458 \text{ flows})$$

### The Technical Explanation
1. **Single-Packet Spoofing Mechanism:** The attack tool `hping3 --rand-source -S` generates single SYN packets with spoofed source IP addresses. The attacker never intends to establish a legitimate TCP connection; the goal is to exhaust the victim's TCP backlog queue.
2. **Zeek Flow Assembly Boundaries:** Zeek tracks network sessions using 5-tuples: $(\text{src\_ip}, \text{src\_port}, \text{dst\_ip}, \text{dst\_port}, \text{proto})$. Because each spoofed SYN arrives from a randomized source IP and port, Zeek treats each individual SYN as an isolated 1-packet connection that immediately times out. Hence, every flow record for `DOS_SYN_Hping` contains exactly **1 SYN packet** ($\text{fwd\_SYN} = 1$).
3. **Why Legitimate Traffic Has High SYN Counts:** Normal smart devices (such as MQTT brokers and ThingSpeak sensors) experience wireless packet loss and re-transmit SYN packets within the same continuous TCP session. Consequently, multi-SYN flows ($\text{fwd\_SYN} > 1$) are characteristic of **benign IoT network retries**, not single-packet DoS attacks!

> **Key Takeaway for Security Operations:** An intrusion detection rule that flags flows with "high SYN packet counts" will fail to detect single-packet SYN floods. Detection systems must monitor global connection arrival rates rather than per-flow SYN flags.

---

## 7. Supervised Machine Learning Benchmark

### 7.1 Model Formulation & Hyperparameters
To satisfy the requirement of evaluating a classification technique, a **Random Forest Classifier** was trained using Scikit-Learn:
* `n_estimators`: 100 decision trees.
* `max_depth`: 20 (preventing infinite leaf expansion).
* `class_weight`: `'balanced_subsample'` (dynamically penalizes minority misclassifications based on the bootstrap sample distribution).
* `random_state`: 42 (ensuring deterministic reproducibility).
* **Train/Test Split:** Stratified 80/20 partition (98,493 training flows, 24,624 test flows).

### 7.2 Leakage Prevention
Network port attributes (`id.orig_p`, `id.resp_p`) and row identifiers were purged prior to feature encoding. The resulting training matrix comprised 81 continuous and categorical telemetry attributes.

### 7.3 Benchmark Results vs. Baseline

| Evaluation Metric | Random Forest (Trained) | Majority-Class Baseline | Empirical Lift |
| :--- | :---: | :---: | :---: |
| **Macro-Averaged F1** | **0.9338** | 0.0724 | **+0.8614** |
| **Balanced Accuracy** | **0.9380** | 0.0833 | **+0.8547** |
| **Weighted-Averaged F1**| **0.9934** | 0.6678 | **+0.3256** |
| **Overall Accuracy** | **0.9935** | 0.7689 | **+0.2246** |

*Note: While overall accuracy is 99.35%, the critical academic metric is Macro-F1 (0.9338), which weights rare minority classes (such as NMAP_FIN_SCAN, $n=28$) equally with the majority flood.*

### 7.4 Top 15 Gini Feature Importances

| Rank | Telemetry Feature Name | Gini Importance | Network Interpretation |
| :---: | :--- | :---: | :--- |
| **1** | `fwd_URG_flag_count` | 0.0418 | Flags abnormal control bit combinations (e.g. XMAS scans). |
| **2** | `fwd_last_window_size` | 0.0406 | Captures client TCP receive window buffer state. |
| **3** | `fwd_PSH_flag_count` | 0.0390 | Differentiates push-data IoT streams from port probes. |
| **4** | `fwd_header_size_tot` | 0.0331 | Total header bytes; distinguishes single-packet sweeps. |
| **5** | `fwd_pkts_payload.avg` | 0.0326 | Average payload size; separates zero-byte scans from data. |
| **6** | `flow_iat.min` | 0.0325 | Minimum inter-arrival time; reflects automated attack bursts. |
| **7** | `fwd_header_size_min` | 0.0319 | Minimal TCP/IP header footprint. |
| **8** | `flow_FIN_flag_count` | 0.0267 | Detects FIN-based stealth port scanning. |
| **9** | `flow_pkts_payload.max` | 0.0257 | Maximum payload volume. |
| **10**| `service_mqtt` | 0.0256 | Binary indicator for MQTT broker communication. |
| **11**| `fwd_pkts_payload.max` | 0.0252 | Maximum forward payload bytes. |
| **12**| `fwd_pkts_payload.tot` | 0.0247 | Cumulative forward payload bytes. |
| **13**| `fwd_header_size_max` | 0.0236 | Maximum forward header size. |
| **14**| `flow_pkts_payload.tot` | 0.0228 | Cumulative bidirectional payload bytes. |
| **15**| `flow_pkts_payload.avg` | 0.0225 | Average bidirectional payload size. |

---

## 8. Visualizations & Software Architecture

IoT PULSE was implemented as a production full-stack analytics platform:

```
┌─────────────────────────────────────────────────────────────┐
│                   IoT PULSE Full-Stack                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌──────────────┐       ┌──────────────┐       ┌────────────────┐
│ React + Vite │       │ FastAPI REST │       │ DuckDB Engine  │
│ 3D Cyber SOC │◄─────►│ 15+ Endpoints│◄─────►│ 123,117 Flows  │
└──────────────┘       └───────┬──────┘       │ In-Memory OLAP │
                               │              └────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │ Power BI & Tableau  │
                    │ 5-Page BI Dashboard │
                    └─────────────────────┘
```

1. **In-Memory Analytical Engine:** Embedded **DuckDB** registers all 123,117 records in memory, providing sub-15ms SQL aggregation performance for interactive web slicing.
2. **FastAPI Backend:** Provides 15+ REST API endpoints supporting live health monitoring, statistical tests, model benchmarking, and dynamic data exports.
3. **Interactive 3D WebGL Interface:** Built using React, Three.js, and React Three Fiber. Features an interactive 3D Network Intelligence Globe, spatial clustering, and tactical telemetry controls.
4. **Business Intelligence Deliverables:**
   - **Power BI:** 5-page report with star-schema data modeling, 10 curated export tables, and 170+ lines of enterprise DAX measures. Supports live REST API refresh (`PowerQuery_M_Templates.pq`) and curated CSV ingestion.
   - **Tableau:** Pre-built native workbook (`IoT_PULSE_Cybersecurity_Analytics.twb`) supporting native macOS and Windows evaluation.
5. **Quality Verification:** 17 automated Pytest unit tests pass with 100% code coverage across routers, data services, and statistical calculators.

---

## 9. Research Limitations & Academic Caveats

### 9.1 Observational vs. Experimental Data
The RT-IOT2022 dataset consists of **observational network traffic captures**, not randomized experimental trials. While two-group comparisons (e.g., TCP vs. UDP packet rates in Q7/Q8, MQTT vs. non-MQTT duration in Q14) demonstrate strong statistical associations ($p < 0.0001$), they **do not prove causal relationships**. Protocol selection was not randomly assigned across identical network devices.

### 9.2 Testbed Generalization Boundaries
Because telemetry was generated in a controlled testbed environment with a finite set of hardware appliances, models trained on this benchmark may learn testbed-specific artifacts. Performance scores reflect separability within this dataset and should not be assumed to generalize identically to enterprise zero-day environments.

### 9.3 Flow Autocorrelation & Clustering
Network flows arriving in rapid succession from the same host exhibit temporal autocorrelation. Standard inferential tests assume independent and identically distributed (i.i.d.) observations; clustered flow bursts can cause test statistics to be inflated and standard errors to be understated.

### 9.4 Temporal Aggregation Resolution
Zeek flow monitors aggregate packet telemetry across flow session intervals rather than logging microsecond packet arrival timestamps. This restricts fine-grained packet sequence modeling without raw PCAP captures.

---

## 10. Evidence-Based Conclusions & Future Work

### 10.1 Key Conclusions
1. **Empirical Temporal Separation:** Benign smart-home IoT devices maintain long-lived sessions (median MQTT duration $\approx 32\text{--}44$ seconds) characterized by small, balanced bidirectional payloads. In contrast, attack flows exhibit microsecond-to-millisecond durations dominated by asymmetric unidirectional bursts.
2. **Non-Parametric Necessity:** Heavy skewness and zero-inflation make parametric methods inappropriate for network telemetry. Non-parametric rank tests provide robust inferential foundations.
3. **Statistical Robustness:** All 11 inferential hypotheses maintained significance under Benjamini–Hochberg FDR control ($p_{\text{adj}} < 0.0001$).
4. **Machine Learning Feasibility:** Incorporating cost-sensitive weighting (`balanced_subsample`) allows tree-based models to achieve high discriminative performance (Macro-F1 = 0.9338) even under extreme 3,380:1 class imbalance.

### 10.2 Future Enhancements
* **Cross-Benchmark Generalization:** Validate the pre-trained model against external benchmarks (e.g., BoT-IoT, TON_IoT).
* **Deep Sequence Architectures:** Evaluate Temporal Convolutional Networks (TCN) and Transformers directly on raw packet streams.
* **Edge Deployment:** Integrate live libpcap packet capture into lightweight DuckDB edge gateways for real-time intrusion prevention.

---

## 11. References & Attributions

1. **RT-IOT2022 Benchmark Dataset:**  
   B. S. Bhati et al., *"RT-IOT2022: A Real-Time IoT Dataset for Network Intrusion Detection Systems,"* IEEE Access / ResearchGate, 2022.
2. **Statistical Foundations:**  
   Course Lecture Materials, *23CSE351: Foundations of Data Science*, Amrita Vishwa Vidyapeetham, 2026.
3. **SciPy Statistical Algorithms:**  
   Virtanen, P. et al., *"SciPy 1.0: Fundamental Algorithms for Scientific Computing in Python,"* *Nature Methods*, 17(3), 261–272, 2020.
4. **Scikit-Learn Machine Learning:**  
   Pedregosa, F. et al., *"Scikit-learn: Machine Learning in Python,"* *Journal of Machine Learning Research*, 12, 2825–2830, 2011.
5. **Zeek Network Security Monitor:**  
   Vern Paxson, *"Bro: A System for Detecting Network Intruders in Real-Time,"* *Computer Networks*, 31(23–24), 2435–2463, 1999.
6. **False Discovery Rate Control:**  
   Benjamini, Y., & Hochberg, Y., *"Controlling the False Discovery Rate: A Practical and Powerful Approach to Multiple Testing,"* *Journal of the Royal Statistical Society: Series B*, 57(1), 289–300, 1995.

---
*End of Documentation — IoT PULSE Research Group*
