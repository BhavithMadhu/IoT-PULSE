# IoT PULSE — Statistical & Machine Learning Methodology

## 1. Problem Statement & Research Objectives

The **IoT PULSE** project investigates network traffic generated in a realistic IoT testbed containing smart home devices, IoT message brokers, and simulated cyber attacks from the **RT-IOT2022** dataset. The primary objective is to evaluate how recorded network-flow attributes vary across attack categories, transport protocols, and application services, and to identify which observed empirical differences have formal statistical support.

---

## 2. Preprocessing & Data Integrity

1. **Dataset Audit:**
   - Source: `RT_IOT2022.csv` (123,117 records × 85 columns).
   - Missing Values: 0 missing cells across all columns (100% complete).
   - Full Duplicates: 0 exact duplicate rows across all 85 columns.
   - Repeated Feature Signatures: 1,180 records share identical network feature values when the target label is excluded. These reflect repetitive IoT device heartbeats and high-speed attack loops. They are retained to preserve empirical base rates while acknowledging potential autocorrelation.

2. **Column Cleaning & Sanitization:**
   - Leading/trailing whitespace was stripped from all column headers and string values.
   - An index-like column (`Unnamed: 0`) containing incremental integer IDs was identified and permanently excluded from statistical analysis and model features.
   - Non-numeric columns with >=98% numeric parseability were coerced to numeric floats.

3. **Port Feature Exclusion:**
   - Ephemeral and well-known port features (`id.orig_p`, `id.resp_p`) were excluded from classification modeling. While port conventions (e.g. port 1883 for MQTT, port 53 for DNS) allow superficial separation, models trained on raw ports risk memorizing collection-specific artifacts rather than learning structural traffic dynamics.

---

## 3. Formal Statistical Methodology (15 Research Questions)

| ID | Title & Analytical Question | Methodology & Test | Hypotheses (\(H_0\) vs \(H_1\)) | Effect Size & Confidence Interval | Statistical Decision (\(\alpha = 0.05\)) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Q1** | Attack label distribution & class imbalance | Frequency table, class shares | Descriptive characterization | Majority Share: 76.89% (DOS_SYN_Hping) | Extreme imbalance: Macro metrics mandatory |
| **Q2** | Association between protocol & attack label | Pearson's \(\chi^2\) test of independence | \(H_0\): `proto` \(\perp\) `Attack_type`<br/>\(H_1\): Dependent | Cramér's V = 0.5834 | Reject \(H_0\) (\(\chi^2 = 83803.12, p < 0.0001\)) |
| **Q3** | Association between service & attack label | Pearson's \(\chi^2\) test (infrequent <100 grouped into Other) | \(H_0\): `service` \(\perp\) `Attack_type`<br/>\(H_1\): Dependent | Cramér's V = 0.6391 | Reject \(H_0\) (\(\chi^2 = 301729.10, p < 0.0001\)) |
| **Q4** | Flow duration differences across attack labels | Kruskal-Wallis H test (groups \(n \ge 30\)) | \(H_0\): Identical duration distributions<br/>\(H_1\): \(\ge 1\) differs | \(\eta^2 \approx H / (N - 1) = 0.3635\) | Reject \(H_0\) (\(H = 44749.48, p < 0.0001\)) |
| **Q5** | Total packet count differences across attack labels | Kruskal-Wallis H test (groups \(n \ge 30\)) | \(H_0\): Identical packet totals<br/>\(H_1\): \(\ge 1\) differs | \(\eta^2 \approx 0.4818\) | Reject \(H_0\) (\(H = 59302.94, p < 0.0001\)) |
| **Q6** | Association between forward & backward packets | Spearman rank correlation | \(H_0\): \(\rho = 0\)<br/>\(H_1\): \(\rho \ne 0\) | Spearman \(\rho = 0.7463\) | Reject \(H_0\) (Strong positive monotonicity, \(p < 0.0001\)) |
| **Q7** | Packet rate comparison: TCP vs UDP | Mann-Whitney U test | \(H_0\): Equal packet rates<br/>\(H_1\): Unequal packet rates | Rank-biserial \(r_{rb} = 0.7314\) | Reject \(H_0\) (\(U = 1.208 \times 10^9, p < 0.0001\)) |
| **Q8** | Payload byte rate comparison: TCP vs UDP | Mann-Whitney U test | \(H_0\): Equal byte rates<br/>\(H_1\): Unequal byte rates | Rank-biserial \(r_{rb} = 0.6622\) | Reject \(H_0\) (\(U = 1.159 \times 10^9, p < 0.0001\)) |
| **Q9** | Association of SYN flags with attack label | Kruskal-Wallis H test (groups \(n \ge 30\)) | \(H_0\): Identical SYN counts<br/>\(H_1\): \(\ge 1\) differs | \(\eta^2 \approx 0.4703\) | Reject \(H_0\) (\(H = 57883.20, p < 0.0001\)) |
| **Q10** | High-SYN proportion: DOS_SYN_Hping vs Others | Two-proportion z-test | \(H_0\): \(p_{\text{dos}} = p_{\text{other}}\)<br/>\(H_1\): \(p_{\text{dos}} \ne p_{\text{other}}\) | Difference: \(-0.3715\)<br/>95% CI: `[-0.3771, -0.3658]` | Reject \(H_0\) (\(z = -196.12, p < 0.0001\)) |
| **Q11** | Flow duration vs packet rate relationship | Spearman rank correlation | \(H_0\): \(\rho = 0\)<br/>\(H_1\): \(\rho \ne 0\) | Spearman \(\rho = -0.2959\) | Reject \(H_0\) (Moderate negative monotonicity, \(p < 0.0001\)) |
| **Q12** | Inter-feature correlation structure | Spearman correlation matrix (12 features) | Exploratory survey | Max pairwise \(|\rho| = 0.7463\) | Collinear blocks in counts/payloads identified |
| **Q13** | Packet ratio (down_up_ratio) across attacks | Kruskal-Wallis H test (groups \(n \ge 30\)) | \(H_0\): Identical ratio distributions<br/>\(H_1\): \(\ge 1\) differs | \(\eta^2 \approx 0.2858\) | Reject \(H_0\) (\(H = 35188.37, p < 0.0001\)) |
| **Q14** | Flow duration: MQTT vs Non-MQTT | Mann-Whitney U test | \(H_0\): Equal duration distributions<br/>\(H_1\): Unequal duration | Rank-biserial \(r_{rb} = 0.9864\) | Reject \(H_0\) (\(U = 4.883 \times 10^8, p < 0.0001\)) |
| **Q15** | Multiclass classification separation | Random Forest vs Dummy Baseline | Predictive signal evaluation | Macro-F1 Lift: \(+0.8614\) | Substantial multiclass separation (\(F_1 = 0.9338\)) |

---

## 4. Multiple-Testing Adjustment (Benjamini-Hochberg FDR)

Conducting multiple statistical tests across the same observational dataset inflates the Family-Wise Error Rate (FWER) and False Discovery Rate (FDR). To guarantee inferential validity:
- Raw \(p\)-values across all inferential tests were corrected using the **Benjamini-Hochberg (BH)** procedure:
  \[
  P_{(i)}^{\text{adj}} = \min \left( 1, \min_{k \ge i} \left( \frac{m}{k} P_{(k)} \right) \right)
  \]
  where \(m\) is the total number of tests and \(i\) is the rank of the ordered \(p\)-value.
- Because sample sizes exceed 100,000 flows and effect sizes are pronounced, all 11 inferential tests maintained adjusted \(p\)-values \(< 0.0001\), surviving FDR correction at \(\alpha = 0.05\).

---

## 5. Explicit Note on Observational Two-Group Comparisons vs A/B Testing

> [!IMPORTANT]
> **Methodological Boundary:**
> The comparisons between TCP and UDP (Q7, Q8), DOS_SYN_Hping and other labels (Q10), and MQTT and non-MQTT (Q14) are **observational group comparisons**. They do **NOT** constitute randomized A/B experiments:
> 1. Traffic flows were not randomly assigned to transport protocols or service types via an experimental intervention.
> 2. Protocol choice is confounded by attack type (e.g., DOS_SYN_Hping is 100% TCP; UDP scans are 100% UDP).
> 3. Statistical significance indicates evidence against the null distribution within this dataset; it does not demonstrate that protocol selection causes higher packet rates.

---

## 6. Machine Learning Pipeline & Prevention of Leakage

1. **Stratified Partitioning:**
   - To reflect class distributions, stratified sampling was applied. A 50,000-flow sample was selected, followed by an 80/20 train/test split stratified on `Attack_type`.

2. **Pipeline Architecture:**
   - Preprocessing transformers were strictly fit **only on training data** within a `scikit-learn Pipeline`:
     - Numeric Pipeline: `SimpleImputer(strategy="median")`
     - Categorical Pipeline: `SimpleImputer(strategy="most_frequent")` followed by `OneHotEncoder(handle_unknown="ignore")`
   - Test data was transformed purely out-of-sample, preventing target leakage and feature contamination.

3. **Evaluation Metrics vs Baseline:**
   - Evaluated against a `DummyClassifier(strategy="most_frequent")`:
     - **Random Forest:** Accuracy = 99.45%, Balanced Accuracy = 94.17%, Macro-F1 = 93.38%, Weighted-F1 = 99.48%.
     - **Majority Baseline:** Accuracy = 76.89%, Balanced Accuracy = 8.33%, Macro-F1 = 7.24%, Weighted-F1 = 66.84%.
   - The dramatic gap in Balanced Accuracy (94.17% vs 8.33%) and Macro-F1 (93.38% vs 7.24%) proves genuine multidimensional separability across minority attack categories.
