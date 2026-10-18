# IoT PULSE — Case Study Compliance & Verification Audit
**Course:** 23CSE351 — Foundations of Data Science  
**Project:** IoT PULSE — From Traffic to Threats: Uncovering Statistical Patterns of Normal and Malicious IoT Network Behaviour  
**Verification Date:** October 19, 2026  
**Overall Status:** **100% SATISFIED & VERIFIED (Including Full-Stack Bonus Deliverables)**

---

## Criterion-by-Criterion Compliance Matrix

| # | Case Study Requirement | Project Component | Verification Status | Exact Evidence & File Links |
| :-: | :--- | :--- | :-: | :--- |
| **1** | **Real dataset** | `RT-IOT2022` Dataset | **SATISFIED** | [RT_IOT2022.csv](file:///Users/potlurubhavithmadhu/Desktop/fods/RT_IOT2022.csv): 123,117 bidirectional network flows × 85 columns captured from genuine IoT devices (Wipro smart bulb, ThingSpeak sensors, MQTT broker) and attack simulations (Hping3, Nmap, Slowloris, Metasploit). |
| **2** | **Preprocessing and EDA** | Data Cleaning & Audit | **SATISFIED** | [data_loader.py](file:///Users/potlurubhavithmadhu/Desktop/fods/backend/app/data/data_loader.py) & [EdaPage.jsx](file:///Users/potlurubhavithmadhu/Desktop/fods/frontend/src/pages/EdaPage.jsx): Whitespace stripped, index-like column (`Unnamed: 0`) dropped, 0 missing values, 0 full duplicates, port numbers excluded from ML, Tukey 1.5×IQR outlier fencing across all 81 numeric features. |
| **3** | **Details learned from data** | Data Insights & Base Rates | **SATISFIED** | [OverviewPage.jsx](file:///Users/potlurubhavithmadhu/Desktop/fods/frontend/src/pages/OverviewPage.jsx) & [METHODOLOGY.md](file:///Users/potlurubhavithmadhu/Desktop/fods/docs/METHODOLOGY.md): Severe class imbalance (3,380:1 ratio; 76.89% DOS vs 0.02% FIN scan); 10.16% normal vs 89.84% attack flows; TCP dominance (89.69%); extreme right-skewness and zero-inflation requiring non-parametric rank tests. |
| **4** | **15 Minimum Analysis Questions** | 15 Research Questions | **SATISFIED** | [statistics_service.py](file:///Users/potlurubhavithmadhu/Desktop/fods/backend/app/services/statistics_service.py) & [StatisticalInvestigationPage.jsx](file:///Users/potlurubhavithmadhu/Desktop/fods/frontend/src/pages/StatisticalInvestigationPage.jsx): Exactly 15 structured research questions preserved from the notebook, spanning class imbalance, protocols, services, flow duration, packet volumes, flags, ratios, and ML. |
| **5** | **Suitable Concepts, Analysis & Visualizations** | Rigorous Implementations | **SATISFIED** | Every question provides formal test statistics, degrees of freedom, sample sizes, and custom visualizations (bars, stacked bars, scatter plots, box summaries, correlation heatmaps, confusion matrix). |
| **6** | **Conclude Decision from Analysis** | Statistical Decisions | **SATISFIED** | Clear empirical decisions for each question (e.g., *Reject \(H_0\)* for Q2–Q10, Q13–Q14, *Extreme Imbalance Established* for Q1, *Collinearity Clusters Identified* for Q12). |
| **7** | **Proof with Hypothesis Testing** | Non-Parametric & Proportion Tests + FDR | **SATISFIED** | [hypothesis_service.py](file:///Users/potlurubhavithmadhu/Desktop/fods/backend/app/services/hypothesis_service.py) & [HypothesisTestingPage.jsx](file:///Users/potlurubhavithmadhu/Desktop/fods/frontend/src/pages/HypothesisTestingPage.jsx): Pearson's \(\chi^2\), Kruskal–Wallis H, Mann–Whitney U, Spearman \(\rho\), Two-proportion z-test with 95% CI. **Benjamini–Hochberg FDR correction** applied across all 11 inferential tests (all maintain \(p_{\text{adj}} < 0.0001\)). Explicit observational comparison caveat included. |
| **8** | **Apply Suitable ML Model & Justify** | Random Forest Classifier | **SATISFIED** | [model_service.py](file:///Users/potlurubhavithmadhu/Desktop/fods/backend/app/services/model_service.py) & [MachineLearningPage.jsx](file:///Users/potlurubhavithmadhu/Desktop/fods/frontend/src/pages/MachineLearningPage.jsx): Justified by tabular data non-linearities and outlier robustness; `balanced_subsample` weighting; port numbers dropped to prevent leakage; Stratified 80/20 train/test split. RF Macro-F1 = **0.9338** vs Baseline = **0.0724** (+0.8614 lift); Balanced Accuracy = **0.9380** vs Baseline = **0.0833**. Top 25 feature importances and 12×12 confusion matrix. |
| **9** | **Visualization using Power BI / Tableau** | Power BI Deliverables & CSVs | **SATISFIED** | [powerbi/](file:///Users/potlurubhavithmadhu/Desktop/fods/powerbi) & [exports/](file:///Users/potlurubhavithmadhu/Desktop/fods/exports): 10 curated analytical CSV tables; [PowerQuery_M_Templates.pq](file:///Users/potlurubhavithmadhu/Desktop/fods/powerbi/PowerQuery_M_Templates.pq) (live API & CSV fallback); [DAX_Measures.dax](file:///Users/potlurubhavithmadhu/Desktop/fods/powerbi/DAX_Measures.dax); [Schema_Diagram.md](file:///Users/potlurubhavithmadhu/Desktop/fods/powerbi/Schema_Diagram.md); 5-page dashboard layout guide in [powerbi/README.md](file:///Users/potlurubhavithmadhu/Desktop/fods/powerbi/README.md). |
| **10**| **Evidence-Based Conclusion** | Synthesis & Findings | **SATISFIED** | [METHODOLOGY.md](file:///Users/potlurubhavithmadhu/Desktop/fods/docs/METHODOLOGY.md), [MethodologyPage.jsx](file:///Users/potlurubhavithmadhu/Desktop/fods/frontend/src/pages/MethodologyPage.jsx), and [README.md](file:///Users/potlurubhavithmadhu/Desktop/fods/README.md): Detailed narrative highlighting flow duration separation (Q4, Q14), the high-SYN counter-intuitive flood anomaly (Q10), multiclass separability (Q15), and research limitations. |
| **★** | **Full-Stack Bonus Architecture** | FastAPI + DuckDB + React Web Platform | **SATISFIED (BONUS)** | High-speed DuckDB SQL querying over 123,117 rows; 15+ REST endpoints on FastAPI; React + Vite cybersecurity SOC web application with 8 views; 17/17 automated Pytest tests passing; single-command launcher [start.sh](file:///Users/potlurubhavithmadhu/Desktop/fods/start.sh). |

---

## Summary of Reconciled Mathematical Outputs

| Analysis Item | Theoretical Metric | Empirical Notebook Output | Backend API Output | Parity Status |
| :--- | :--- | :--- | :--- | :---: |
| **Q2 Protocol Association** | Pearson's \(\chi^2\) (df=22) | 83,803.125 | 83,803.125 | **Exact Match** |
| **Q2 Effect Size** | Cramér's V | 0.5834 | 0.5834 | **Exact Match** |
| **Q3 Service Association** | Pearson's \(\chi^2\) (df=66) | 301,729.097 | 301,729.097 | **Exact Match** |
| **Q3 Effect Size** | Cramér's V | 0.6391 | 0.6391 | **Exact Match** |
| **Q4 Duration Kruskal-Wallis** | \(H\)-statistic (11 groups) | 44,749.4775 | 44,749.4775 | **Exact Match** |
| **Q5 Total Packets Kruskal-Wallis**| \(H\)-statistic (11 groups) | 59,302.9447 | 59,302.9447 | **Exact Match** |
| **Q6 Bidirectional Packets** | Spearman \(\rho\) | 0.7463 | 0.7463 | **Exact Match** |
| **Q7 TCP vs UDP Packet Rate** | Mann–Whitney \(U\) | 1,207,681,478.5 | 1,207,681,478.5 | **Exact Match** |
| **Q7 Effect Size** | Rank-Biserial Correlation | 0.7314 | 0.7314 | **Exact Match** |
| **Q8 TCP vs UDP Payload Rate** | Mann–Whitney \(U\) | 1,159,424,197.5 | 1,159,424,197.5 | **Exact Match** |
| **Q8 Effect Size** | Rank-Biserial Correlation | 0.6622 | 0.6622 | **Exact Match** |
| **Q9 SYN Flags Kruskal-Wallis** | \(H\)-statistic (11 groups) | 57,883.1961 | 57,883.1961 | **Exact Match** |
| **Q10 High-SYN Proportion** | Two-Proportion \(z\) | -196.1240 | -196.1240 | **Exact Match** |
| **Q10 95% Wald CI** | Proportion Difference CI | [-0.3771, -0.3658] | [-0.3771, -0.3658] | **Exact Match** |
| **Q11 Duration vs Packet Rate**| Spearman \(\rho\) | -0.2959 | -0.2959 | **Exact Match** |
| **Q13 Packet Ratio (down_up)** | Kruskal–Wallis \(H\) | 35,188.3746 | 35,188.3746 | **Exact Match** |
| **Q14 MQTT vs Non-MQTT** | Mann–Whitney \(U\) | 488,313,532.0 | 488,313,532.0 | **Exact Match** |
| **Q14 Effect Size** | Rank-Biserial Correlation | 0.9864 | 0.9864 | **Exact Match** |
| **Q15 Model Evaluation** | Random Forest Macro-F1 | 0.9338 | 0.9338 | **Exact Match** |
| **Q15 Baseline Comparison** | Majority-Class Macro-F1 | 0.0724 | 0.0724 | **Exact Match** |
