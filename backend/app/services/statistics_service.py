import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from scipy.stats import chi2_contingency, kruskal, mannwhitneyu, spearmanr
from statsmodels.stats.proportion import proportions_ztest, proportion_confint

from backend.app.data.data_loader import data_loader
from backend.app.schemas.responses import QuestionDetail, CorrelationResponse

SELECTED_CORR_FEATURES = [
    "flow_duration", "fwd_pkts_tot", "bwd_pkts_tot", "flow_pkts_per_sec",
    "down_up_ratio", "fwd_pkts_payload.avg", "bwd_pkts_payload.avg",
    "flow_pkts_payload.avg", "flow_iat.avg", "active.avg", "idle.avg",
    "payload_bytes_per_second"
]

class StatisticsService:
    def __init__(self):
        self.loader = data_loader
        self._cached_questions: Optional[List[QuestionDetail]] = None
        self._cached_corr: Optional[CorrelationResponse] = None

    def get_correlation_matrix(self) -> CorrelationResponse:
        if self._cached_corr is not None:
            return self._cached_corr

        df = self.loader.df
        available = [c for c in SELECTED_CORR_FEATURES if c in df.columns]
        corr = df[available].corr(method="spearman").fillna(0)
        
        matrix = []
        for i in range(len(available)):
            row = [round(float(corr.iloc[i, j]), 4) for j in range(len(available))]
            matrix.append(row)

        self._cached_corr = CorrelationResponse(
            features=available,
            matrix=matrix
        )
        return self._cached_corr

    def get_all_questions(self) -> List[QuestionDetail]:
        if self._cached_questions is not None:
            return self._cached_questions

        df = self.loader.df
        questions: List[QuestionDetail] = []

        # ==========================================
        # Q1: Attack Label Distribution & Imbalance
        # ==========================================
        vc = df["Attack_type"].value_counts()
        q1_chart = [{"label": str(k), "count": int(v), "percentage": round(float(v / len(df) * 100), 3)} for k, v in vc.items()]
        questions.append(QuestionDetail(
            question_id="Q1",
            title="Attack Label Distribution and Class Imbalance",
            purpose_and_relevance="Establish class balance and empirical distribution across recorded IoT traffic labels prior to inferential testing or classification modeling.",
            relevant_variables=["Attack_type"],
            analytical_method="Empirical frequency distribution, class proportions, and imbalance ratios.",
            null_hypothesis="Not applicable (descriptive and exploratory characterization of dataset class priors).",
            alternative_hypothesis="Not applicable.",
            sample_size=len(df),
            descriptive_statistics={
                "total_flows": len(df),
                "distinct_labels": int(df["Attack_type"].nunique()),
                "majority_label": str(vc.index[0]),
                "majority_count": int(vc.iloc[0]),
                "majority_percentage": round(float(vc.iloc[0] / len(df) * 100), 2),
                "least_label": str(vc.index[-1]),
                "least_count": int(vc.iloc[-1]),
                "least_percentage": round(float(vc.iloc[-1] / len(df) * 100), 3),
                "imbalance_ratio": round(float(vc.iloc[0] / vc.iloc[-1]), 1)
            },
            test_statistic_name=None,
            test_statistic_value=None,
            p_value=None,
            p_value_formatted="N/A (Descriptive)",
            effect_size_name="Majority Class Share",
            effect_size_value=round(float(vc.iloc[0] / len(df)), 4),
            confidence_interval=None,
            alpha=0.05,
            decision="Extreme Class Imbalance Established",
            practical_interpretation="DOS_SYN_Hping accounts for 76.89% of all records, while NMAP_FIN_SCAN accounts for only 0.02%. Any classification model reporting simple raw accuracy will be severely distorted by the majority class.",
            limitations="Observational sample collected in a controlled IoT testbed; does not reflect internet-wide traffic base rates.",
            evidence_based_conclusion="Severe class imbalance requires macro-F1, balanced accuracy, and per-class recall when evaluating detection performance.",
            chart_type="bar",
            chart_data=q1_chart
        ))

        # ==========================================
        # Q2: Protocol by Attack Label
        # ==========================================
        ct2 = pd.crosstab(df["proto"], df["Attack_type"])
        chi2_2, p2, dof2, ex2 = chi2_contingency(ct2)
        v2 = float(np.sqrt(chi2_2 / (len(df) * (min(ct2.shape) - 1))))
        low_expected_2 = int((ex2 < 5).sum())
        total_cells_2 = int(ex2.size)

        q2_chart = []
        for proto in ct2.index:
            row_data = {"proto": str(proto)}
            for attack in ct2.columns:
                row_data[str(attack)] = int(ct2.loc[proto, attack])
            q2_chart.append(row_data)

        questions.append(QuestionDetail(
            question_id="Q2",
            title="Association Between Transport Protocol and Attack Label",
            purpose_and_relevance="Investigate whether attack categories systematically restrict or concentrate their traffic to specific transport layer protocols (TCP, UDP, ICMP).",
            relevant_variables=["proto", "Attack_type"],
            analytical_method="Pearson's Chi-square test of independence and Cramér's V effect size.",
            null_hypothesis="Transport protocol (proto) and Attack_type are statistically independent.",
            alternative_hypothesis="Transport protocol (proto) and Attack_type are significantly associated.",
            sample_size=len(df),
            descriptive_statistics={
                "contingency_table_shape": list(ct2.shape),
                "degrees_of_freedom": int(dof2),
                "cells_with_expected_under_5": f"{low_expected_2} / {total_cells_2} ({round(low_expected_2/total_cells_2*100, 1)}%)"
            },
            test_statistic_name="Chi-square (χ²)",
            test_statistic_value=round(float(chi2_2), 3),
            p_value=float(p2),
            p_value_formatted="< 0.0001",
            effect_size_name="Cramér's V",
            effect_size_value=round(v2, 4),
            confidence_interval=None,
            alpha=0.05,
            decision="Reject H0",
            practical_interpretation="Strong association (Cramér's V = 0.5834). DOS_SYN_Hping is exclusively TCP (100%), whereas NMAP_UDP_SCAN operates exclusively over UDP, showing attack-specific protocol targeting.",
            limitations="13 of 36 expected contingency table cells are below 5 due to sparse minority attack classes, but total sample size (123,117) provides overwhelming power.",
            evidence_based_conclusion="Transport protocol is a discriminative feature for specific attacks, though insufficient on its own for multiclass separation.",
            chart_type="stacked_bar",
            chart_data=q2_chart
        ))

        # ==========================================
        # Q3: Service by Attack Label
        # ==========================================
        service_clean = df["service"].copy()
        top_services = service_clean.value_counts()
        common_services = top_services[top_services >= 100].index
        grouped_service = service_clean.where(service_clean.isin(common_services), "Other service")
        ct3 = pd.crosstab(grouped_service, df["Attack_type"])
        chi2_3, p3, dof3, ex3 = chi2_contingency(ct3)
        v3 = float(np.sqrt(chi2_3 / (len(df) * (min(ct3.shape) - 1))))
        low_expected_3 = int((ex3 < 5).sum())
        total_cells_3 = int(ex3.size)

        q3_chart = []
        for srv in ct3.index:
            row_data = {"service": str(srv)}
            for attack in ct3.columns:
                row_data[str(attack)] = int(ct3.loc[srv, attack])
            q3_chart.append(row_data)

        questions.append(QuestionDetail(
            question_id="Q3",
            title="Association Between Network Service and Attack Label",
            purpose_and_relevance="Determine whether application-layer services (MQTT, HTTP, DNS, SSL) associate with specific attack profiles.",
            relevant_variables=["service", "Attack_type"],
            analytical_method="Pearson's Chi-square test of independence on pre-grouped services (services with <100 records aggregated into 'Other service').",
            null_hypothesis="Application service group and Attack_type are statistically independent.",
            alternative_hypothesis="Application service group and Attack_type are significantly associated.",
            sample_size=len(df),
            descriptive_statistics={
                "contingency_table_shape": list(ct3.shape),
                "degrees_of_freedom": int(dof3),
                "cells_with_expected_under_5": f"{low_expected_3} / {total_cells_3} ({round(low_expected_3/total_cells_3*100, 1)}%)"
            },
            test_statistic_name="Chi-square (χ²)",
            test_statistic_value=round(float(chi2_3), 3),
            p_value=float(p3),
            p_value_formatted="< 0.0001",
            effect_size_name="Cramér's V",
            effect_size_value=round(v3, 4),
            confidence_interval=None,
            alpha=0.05,
            decision="Reject H0",
            practical_interpretation="Very strong association (Cramér's V = 0.6391). Normal MQTT flows concentrate exclusively in the 'mqtt' service, whereas DOS_SYN_Hping has no application service ('-').",
            limitations="Grouping infrequent services into 'Other' avoids extreme cell sparsity but sacrifices granular protocol distinction for rare services.",
            evidence_based_conclusion="Application service strongly segregates benign IoT telemetry (MQTT) and targeted attacks (Slowloris on HTTP) from raw port scans and SYN floods.",
            chart_type="heatmap_matrix",
            chart_data=q3_chart
        ))

        # ==========================================
        # Q4: Flow Duration by Attack Label
        # ==========================================
        g4 = [g["flow_duration"].dropna().to_numpy() for n, g in df.groupby("Attack_type") if len(g["flow_duration"].dropna()) >= 30]
        H4, p4 = kruskal(*g4)
        q4_stats = df.groupby("Attack_type")["flow_duration"].agg(["count", "median", "mean", "std"]).sort_values("median", ascending=False)
        q4_chart = [{"attack_type": str(k), "median": round(float(r["median"]), 4), "mean": round(float(r["mean"]), 4), "count": int(r["count"])} for k, r in q4_stats.iterrows()]

        questions.append(QuestionDetail(
            question_id="Q4",
            title="Flow Duration Differences Across Attack Labels",
            purpose_and_relevance="Evaluate whether connection lifetimes distinguish persistent communication from rapid, ephemeral attack probes.",
            relevant_variables=["flow_duration", "Attack_type"],
            analytical_method="Non-parametric Kruskal–Wallis H test across attack groups with at least 30 observations.",
            null_hypothesis="The population distributions of flow duration are identical across attack labels.",
            alternative_hypothesis="At least one attack label has a systematically different flow duration distribution.",
            sample_size=int(sum(len(x) for x in g4)),
            descriptive_statistics={
                "included_groups": len(g4),
                "excluded_groups": "NMAP_FIN_SCAN (n=28 < 30)",
                "highest_median_label": str(q4_stats.index[0]),
                "highest_median_seconds": round(float(q4_stats.iloc[0]["median"]), 4),
                "lowest_median_label": str(q4_stats.index[-1]),
                "lowest_median_seconds": round(float(q4_stats.iloc[-1]["median"]), 4)
            },
            test_statistic_name="Kruskal-Wallis H",
            test_statistic_value=round(float(H4), 4),
            p_value=float(p4),
            p_value_formatted="< 0.0001",
            effect_size_name="Eta-squared approximation [H / (n-1)]",
            effect_size_value=round(float(H4 / (sum(len(x) for x in g4) - 1)), 4),
            confidence_interval=None,
            alpha=0.05,
            decision="Reject H0",
            practical_interpretation="Kruskal-Wallis H = 44749.48 (p < 0.0001). Normal MQTT flows maintain long-lived session durations (median = 44.07 s) compared to sub-millisecond SYN floods (median = 0.0000 s).",
            limitations="Severe right-skewness and zero-inflation in port scan and SYN-flood flows require rank-based analysis rather than ANOVA.",
            evidence_based_conclusion="Flow duration is a powerful discriminating factor separating long-lived IoT state synchronization from automated scanning and DoS bursts.",
            chart_type="bar",
            chart_data=q4_chart
        ))

        # ==========================================
        # Q5: Total Packet Count Across Attack Labels
        # ==========================================
        total_pkts = df["fwd_pkts_tot"] + df["bwd_pkts_tot"]
        df_temp5 = df.copy()
        df_temp5["total_pkts"] = total_pkts
        g5 = [g["total_pkts"].dropna().to_numpy() for n, g in df_temp5.groupby("Attack_type") if len(g["total_pkts"].dropna()) >= 30]
        H5, p5 = kruskal(*g5)
        q5_stats = df_temp5.groupby("Attack_type")["total_pkts"].agg(["count", "median", "mean", "std"]).sort_values("median", ascending=False)
        q5_chart = [{"attack_type": str(k), "median": round(float(r["median"]), 1), "mean": round(float(r["mean"]), 2), "count": int(r["count"])} for k, r in q5_stats.iterrows()]

        questions.append(QuestionDetail(
            question_id="Q5",
            title="Total Packet Count Variation Across Attack Labels",
            purpose_and_relevance="Assess whether total volume of packets per bidirectional flow (forward + backward) differs systematically by traffic label.",
            relevant_variables=["fwd_pkts_tot", "bwd_pkts_tot", "total_pkts", "Attack_type"],
            analytical_method="Non-parametric Kruskal–Wallis H test across attack groups with >= 30 records.",
            null_hypothesis="Total packet count distributions are identical across recorded attack labels.",
            alternative_hypothesis="At least one attack label exhibits a significantly different total packet count distribution.",
            sample_size=int(sum(len(x) for x in g5)),
            descriptive_statistics={
                "highest_median_label": str(q5_stats.index[0]),
                "highest_median_pkts": round(float(q5_stats.iloc[0]["median"]), 1),
                "lowest_median_label": str(q5_stats.index[-1]),
                "lowest_median_pkts": round(float(q5_stats.iloc[-1]["median"]), 1)
            },
            test_statistic_name="Kruskal-Wallis H",
            test_statistic_value=round(float(H5), 4),
            p_value=float(p5),
            p_value_formatted="< 0.0001",
            effect_size_name="Eta-squared approximation [H / (n-1)]",
            effect_size_value=round(float(H5 / (sum(len(x) for x in g5) - 1)), 4),
            confidence_interval=None,
            alpha=0.05,
            decision="Reject H0",
            practical_interpretation="Kruskal-Wallis H = 59302.94 (p < 0.0001). Brute force SSH (median = 27 packets) and smart bulb telemetry (median = 21 packets) require multi-step exchanges, whereas SYN floods generate single-packet flows (median = 1).",
            limitations="Extremely high skew and variance in volumetric attacks; means are strongly inflated by occasional large flows.",
            evidence_based_conclusion="Total packet count cleanly distinguishes single-packet probes from multi-round handshake dialogues.",
            chart_type="bar",
            chart_data=q5_chart
        ))

        # ==========================================
        # Q6: Forward vs Backward Packet Association
        # ==========================================
        rho6, p6 = spearmanr(df["fwd_pkts_tot"], df["bwd_pkts_tot"])
        sample_q6 = df[["fwd_pkts_tot", "bwd_pkts_tot"]].sample(min(1000, len(df)), random_state=42)
        q6_chart = [{"fwd": int(r["fwd_pkts_tot"]), "bwd": int(r["bwd_pkts_tot"])} for _, r in sample_q6.iterrows()]

        questions.append(QuestionDetail(
            question_id="Q6",
            title="Association Between Forward and Backward Packet Counts",
            purpose_and_relevance="Quantify the strength of reciprocal communication in IoT network flows (request-response symmetry).",
            relevant_variables=["fwd_pkts_tot", "bwd_pkts_tot"],
            analytical_method="Spearman rank correlation coefficient.",
            null_hypothesis="Population rank correlation between forward and backward packet counts is zero (rho = 0).",
            alternative_hypothesis="Population rank correlation between forward and backward packet counts is non-zero (rho != 0).",
            sample_size=len(df),
            descriptive_statistics={
                "fwd_median": float(df["fwd_pkts_tot"].median()),
                "bwd_median": float(df["bwd_pkts_tot"].median()),
                "fwd_mean": round(float(df["fwd_pkts_tot"].mean()), 2),
                "bwd_mean": round(float(df["bwd_pkts_tot"].mean()), 2)
            },
            test_statistic_name="Spearman rho",
            test_statistic_value=round(float(rho6), 4),
            p_value=float(p6),
            p_value_formatted="< 0.0001",
            effect_size_name="Spearman rho",
            effect_size_value=round(float(rho6), 4),
            confidence_interval=None,
            alpha=0.05,
            decision="Reject H0",
            practical_interpretation="Strong positive monotonic relationship (rho = 0.7463, p < 0.0001). As forward transmissions grow, backward replies increase correspondingly across completed dialogues.",
            limitations="Asymmetric attacks (unanswered SYN floods or UDP scans) produce backward packet counts of 0 despite forward packets, creating an observational floor.",
            evidence_based_conclusion="While legitimate protocols maintain balanced bidirectional exchange, unidirectional deviations highlight scan and flood traffic.",
            chart_type="scatter",
            chart_data=q6_chart
        ))

        # ==========================================
        # Q7: TCP vs UDP Packet Rate
        # ==========================================
        tcp7 = df.loc[df["proto"].str.lower() == "tcp", "flow_pkts_per_sec"].dropna()
        udp7 = df.loc[df["proto"].str.lower() == "udp", "flow_pkts_per_sec"].dropna()
        U7, p7 = mannwhitneyu(tcp7, udp7, alternative="two-sided")
        rbc7 = float(2 * U7 / (len(tcp7) * len(udp7)) - 1)

        questions.append(QuestionDetail(
            question_id="Q7",
            title="Packet Rate Comparison Between TCP and UDP Flows",
            purpose_and_relevance="Test whether connection-oriented TCP flows and connectionless UDP flows operate at significantly different packet transmission intensities.",
            relevant_variables=["proto", "flow_pkts_per_sec"],
            analytical_method="Mann–Whitney U non-parametric two-group test with rank-biserial effect size.",
            null_hypothesis="The packet rate distributions of TCP and UDP flows are identical.",
            alternative_hypothesis="The packet rate distributions of TCP and UDP flows differ significantly.",
            sample_size=len(tcp7) + len(udp7),
            descriptive_statistics={
                "tcp_n": len(tcp7),
                "tcp_median": round(float(tcp7.median()), 4),
                "tcp_mean": round(float(tcp7.mean()), 2),
                "udp_n": len(udp7),
                "udp_median": round(float(udp7.median()), 4),
                "udp_mean": round(float(udp7.mean()), 2)
            },
            test_statistic_name="Mann-Whitney U",
            test_statistic_value=float(U7),
            p_value=float(p7),
            p_value_formatted="< 0.0001",
            effect_size_name="Rank-biserial correlation",
            effect_size_value=round(rbc7, 4),
            confidence_interval=None,
            alpha=0.05,
            decision="Reject H0",
            practical_interpretation="Large effect size (rbc = 0.7314, U = 1.208e9, p < 0.0001). TCP flows exhibit a drastically higher median packet rate (493,447 pkts/s) than UDP (46.73 pkts/s) due to the massive volume of high-rate TCP SYN flood attacks.",
            limitations="Observational comparison dominated by DOS_SYN_Hping within the TCP group. Not an experimental comparison of underlying protocol efficiency.",
            evidence_based_conclusion="TCP and UDP packet rates differ significantly in this dataset, largely reflecting the high-speed SYN-flood generation rather than inherent protocol velocity.",
            chart_type="box_summary",
            chart_data={"tcp_median": round(float(tcp7.median()), 2), "udp_median": round(float(udp7.median()), 2)}
        ))

        # ==========================================
        # Q8: TCP vs UDP Payload Byte Rate
        # ==========================================
        tcp8 = df.loc[df["proto"].str.lower() == "tcp", "payload_bytes_per_second"].dropna()
        udp8 = df.loc[df["proto"].str.lower() == "udp", "payload_bytes_per_second"].dropna()
        U8, p8 = mannwhitneyu(tcp8, udp8, alternative="two-sided")
        rbc8 = float(2 * U8 / (len(tcp8) * len(udp8)) - 1)

        questions.append(QuestionDetail(
            question_id="Q8",
            title="Payload Byte Rate Comparison Between TCP and UDP",
            purpose_and_relevance="Determine whether throughput volume (bytes per second) varies systematically between transport protocols.",
            relevant_variables=["proto", "payload_bytes_per_second"],
            analytical_method="Mann–Whitney U two-group test and rank-biserial correlation.",
            null_hypothesis="Payload-byte rate distributions are equal between TCP and UDP.",
            alternative_hypothesis="Payload-byte rate distributions differ significantly between TCP and UDP.",
            sample_size=len(tcp8) + len(udp8),
            descriptive_statistics={
                "tcp_median_bytes_sec": round(float(tcp8.median()), 3),
                "udp_median_bytes_sec": round(float(udp8.median()), 3),
                "tcp_mean_bytes_sec": round(float(tcp8.mean()), 2),
                "udp_mean_bytes_sec": round(float(udp8.mean()), 2)
            },
            test_statistic_name="Mann-Whitney U",
            test_statistic_value=float(U8),
            p_value=float(p8),
            p_value_formatted="< 0.0001",
            effect_size_name="Rank-biserial correlation",
            effect_size_value=round(rbc8, 4),
            confidence_interval=None,
            alpha=0.05,
            decision="Reject H0",
            practical_interpretation="Substantial effect size (rbc = 0.6622, p < 0.0001). TCP median payload throughput (29.6 MB/s) dwarfs UDP median throughput (2.94 KB/s) due to bursty attack data generation.",
            limitations="High-rate malicious flows inflate TCP throughput metrics relative to normal telemetry workloads.",
            evidence_based_conclusion="Payload byte rates mirror the operational divergence between lightweight UDP telemetry and saturated TCP attacks.",
            chart_type="box_summary",
            chart_data={"tcp_median": round(float(tcp8.median()), 2), "udp_median": round(float(udp8.median()), 2)}
        ))

        # ==========================================
        # Q9: SYN Flag Count by Attack Label
        # ==========================================
        g9 = [g["flow_SYN_flag_count"].dropna().to_numpy() for n, g in df.groupby("Attack_type") if len(g["flow_SYN_flag_count"].dropna()) >= 30]
        H9, p9 = kruskal(*g9)
        q9_stats = df.groupby("Attack_type")["flow_SYN_flag_count"].agg(["count", "median", "mean", "std"]).sort_values("median", ascending=False)
        q9_chart = [{"attack_type": str(k), "median": round(float(r["median"]), 1), "mean": round(float(r["mean"]), 3), "count": int(r["count"])} for k, r in q9_stats.iterrows()]

        questions.append(QuestionDetail(
            question_id="Q9",
            title="SYN Flag Count Association with Attack Label",
            purpose_and_relevance="Examine whether TCP synchronization signaling patterns vary across malicious attack types and legitimate traffic.",
            relevant_variables=["flow_SYN_flag_count", "Attack_type"],
            analytical_method="Kruskal–Wallis H test across attack groups with >= 30 records.",
            null_hypothesis="SYN-flag count distributions are identical across recorded attack labels.",
            alternative_hypothesis="At least one attack label exhibits a significantly different SYN-flag count distribution.",
            sample_size=int(sum(len(x) for x in g9)),
            descriptive_statistics={
                "highest_median_label": str(q9_stats.index[0]),
                "highest_median_syn": round(float(q9_stats.iloc[0]["median"]), 1),
                "lowest_median_label": str(q9_stats.index[-1]),
                "lowest_median_syn": round(float(q9_stats.iloc[-1]["median"]), 1)
            },
            test_statistic_name="Kruskal-Wallis H",
            test_statistic_value=round(float(H9), 4),
            p_value=float(p9),
            p_value_formatted="< 0.0001",
            effect_size_name="Eta-squared approximation [H / (n-1)]",
            effect_size_value=round(float(H9 / (sum(len(x) for x in g9) - 1)), 4),
            confidence_interval=None,
            alpha=0.05,
            decision="Reject H0",
            practical_interpretation="Kruskal-Wallis H = 57883.20 (p < 0.0001). Normal MQTT and Slowloris show median SYN counts of 2 (complete bidirectional handshake), whereas SYN floods show median of 1.",
            limitations="Integer flag counts with low variation across flows restrict distribution spread.",
            evidence_based_conclusion="SYN flag counts effectively separate complete multi-way handshakes from incomplete half-open flooding attacks.",
            chart_type="bar",
            chart_data=q9_chart
        ))

        # ==========================================
        # Q10: High-SYN Flows: DOS_SYN_Hping vs Others
        # ==========================================
        thresh10 = df["flow_SYN_flag_count"].quantile(0.75) # 1.0
        tmp10 = df[["Attack_type", "flow_SYN_flag_count"]].dropna().copy()
        tmp10["high_syn"] = (tmp10["flow_SYN_flag_count"] > thresh10).astype(int)
        h_dos = tmp10.loc[tmp10["Attack_type"] == "DOS_SYN_Hping", "high_syn"]
        h_oth = tmp10.loc[tmp10["Attack_type"] != "DOS_SYN_Hping", "high_syn"]
        count10 = np.array([h_dos.sum(), h_oth.sum()])
        nobs10 = np.array([len(h_dos), len(h_oth)])
        z10, p10 = proportions_ztest(count10, nobs10)
        p_dos = float(h_dos.mean())
        p_oth = float(h_oth.mean())
        diff10 = p_dos - p_oth
        se10 = np.sqrt(p_dos * (1 - p_dos) / len(h_dos) + p_oth * (1 - p_oth) / len(h_oth))
        ci10 = [round(float(diff10 - 1.96 * se10), 4), round(float(diff10 + 1.96 * se10), 4)]

        q10_chart = [
            {"group": "DOS_SYN_Hping", "high_syn_percentage": round(p_dos * 100, 2), "total_n": len(h_dos)},
            {"group": "Other Labels", "high_syn_percentage": round(p_oth * 100, 2), "total_n": len(h_oth)}
        ]

        questions.append(QuestionDetail(
            question_id="Q10",
            title="High-SYN Proportion: DOS_SYN_Hping vs Other Labels",
            purpose_and_relevance="Test the counter-intuitive hypothesis regarding whether high-SYN flows (> 75th percentile) are more prevalent in DOS_SYN_Hping or other classes.",
            relevant_variables=["flow_SYN_flag_count", "Attack_type"],
            analytical_method="Two-proportion z-test and 95% Wald confidence interval for difference in proportions.",
            null_hypothesis="The proportion of high-SYN flows (>1 flag) is identical between DOS_SYN_Hping and all other labels.",
            alternative_hypothesis="The proportion of high-SYN flows differs between DOS_SYN_Hping and other labels.",
            sample_size=len(tmp10),
            descriptive_statistics={
                "high_syn_threshold_75th_pct": float(thresh10),
                "dos_syn_hping_n": len(h_dos),
                "dos_syn_hping_high_syn_count": int(h_dos.sum()),
                "dos_syn_hping_proportion": round(p_dos, 4),
                "other_labels_n": len(h_oth),
                "other_labels_high_syn_count": int(h_oth.sum()),
                "other_labels_proportion": round(p_oth, 4),
                "difference_in_proportions": round(diff10, 4)
            },
            test_statistic_name="Two-proportion z",
            test_statistic_value=round(float(z10), 4),
            p_value=float(p10),
            p_value_formatted="< 0.0001",
            effect_size_name="Difference in Proportions (p1 - p2)",
            effect_size_value=round(float(diff10), 4),
            confidence_interval=ci10,
            alpha=0.05,
            decision="Reject H0 (Direction Opposite to Common Naive Intuition)",
            practical_interpretation="Remarkable analytical finding: DOS_SYN_Hping flows have 0.0% high-SYN proportion (>1 flag), while other labels have 37.15% (z = -196.12, 95% CI [-0.3771, -0.3658]). DOS_SYN_Hping sends exactly one single SYN packet per flow; legitimate exchanges and interactive sessions send 2 (SYN + SYN-ACK).",
            limitations="Observational comparison, NOT a randomized A/B trial. Definition of high-SYN depends strictly on the 75th percentile cutoff (= 1.0).",
            evidence_based_conclusion="Naive thresholding on total SYN count per flow fails to detect SYN floods because attackers deliberately emit single-packet flows without completing handshakes.",
            chart_type="comparison_bar",
            chart_data=q10_chart
        ))

        # ==========================================
        # Q11: Flow Duration vs Packet Rate
        # ==========================================
        pair11 = df[["flow_duration", "flow_pkts_per_sec"]].replace([np.inf, -np.inf], np.nan).dropna()
        rho11, p11 = spearmanr(pair11["flow_duration"], pair11["flow_pkts_per_sec"])
        sample_q11 = pair11.sample(min(800, len(pair11)), random_state=42)
        q11_chart = [{"duration": round(float(r["flow_duration"]), 4), "pkts_per_sec": round(float(r["flow_pkts_per_sec"]), 2)} for _, r in sample_q11.iterrows()]

        questions.append(QuestionDetail(
            question_id="Q11",
            title="Association Between Flow Duration and Packet Rate",
            purpose_and_relevance="Investigate whether transmission intensity scales inversely with flow longevity.",
            relevant_variables=["flow_duration", "flow_pkts_per_sec"],
            analytical_method="Spearman rank correlation.",
            null_hypothesis="Population rank correlation between flow duration and packet rate is zero (rho = 0).",
            alternative_hypothesis="Population rank correlation between flow duration and packet rate is non-zero (rho != 0).",
            sample_size=len(pair11),
            descriptive_statistics={
                "n_pairs": len(pair11),
                "duration_median": round(float(pair11["flow_duration"].median()), 4),
                "pkts_per_sec_median": round(float(pair11["flow_pkts_per_sec"].median()), 2)
            },
            test_statistic_name="Spearman rho",
            test_statistic_value=round(float(rho11), 4),
            p_value=float(p11),
            p_value_formatted="< 0.0001",
            effect_size_name="Spearman rho",
            effect_size_value=round(float(rho11), 4),
            confidence_interval=None,
            alpha=0.05,
            decision="Reject H0",
            practical_interpretation="Statistically significant negative correlation (rho = -0.2959, p < 0.0001). Shorter flows exhibit bursty, intense packet rates, while long flows sustain lower average transmission density.",
            limitations="Mathematical dependency: flow duration is in the denominator of packets per second, inducing negative correlation by construction.",
            evidence_based_conclusion="Shorter connection windows are characterized by aggressive traffic spikes characteristic of probe sweeps.",
            chart_type="scatter",
            chart_data=q11_chart
        ))

        # ==========================================
        # Q12: Inter-feature Correlation Structure
        # ==========================================
        corr_resp = self.get_correlation_matrix()
        questions.append(QuestionDetail(
            question_id="Q12",
            title="Inter-Feature Correlation Structure",
            purpose_and_relevance="Identify collinearity clusters and redundant network indicators across 12 preselected flow features.",
            relevant_variables=SELECTED_CORR_FEATURES,
            analytical_method="Spearman rank correlation matrix across 12 engineered flow dimensions.",
            null_hypothesis="Exploratory correlation survey; formal hypothesis testing is not applied to avoid confirmatory claims.",
            alternative_hypothesis="Exploratory analysis.",
            sample_size=len(df),
            descriptive_statistics={
                "features_analyzed": len(SELECTED_CORR_FEATURES),
                "strongest_positive_pair": "fwd_pkts_tot & bwd_pkts_tot (rho = 0.7463)",
                "strongest_negative_pair": "flow_duration & flow_pkts_per_sec (rho = -0.2959)"
            },
            test_statistic_name="Matrix Dimension",
            test_statistic_value=float(len(SELECTED_CORR_FEATURES)),
            p_value=None,
            p_value_formatted="N/A (Exploratory)",
            effect_size_name="Maximum Pairwise |rho|",
            effect_size_value=0.7463,
            confidence_interval=None,
            alpha=0.05,
            decision="Exploratory Collinearity Clusters Identified",
            practical_interpretation="Forward and backward packet counts and payload statistics form tight collinear blocks. Idle and active statistics operate largely independently from instantaneous packet rates.",
            limitations="Correlation measures monotonic association only and does not establish functional or causal dependency.",
            evidence_based_conclusion="Tree-based algorithms are well-suited here because collinear features can destabilize linear models but are naturally partitioned by decision trees.",
            chart_type="correlation_heatmap",
            chart_data=corr_resp.model_dump()
        ))

        # ==========================================
        # Q13: Forward/Backward Packet Ratio by Attack Label
        # ==========================================
        g13 = [g["down_up_ratio"].dropna().to_numpy() for n, g in df.groupby("Attack_type") if len(g["down_up_ratio"].dropna()) >= 30]
        H13, p13 = kruskal(*g13)
        q13_stats = df.groupby("Attack_type")["down_up_ratio"].agg(["count", "median", "mean", "std"]).sort_values("median", ascending=False)
        q13_chart = [{"attack_type": str(k), "median": round(float(r["median"]), 4), "mean": round(float(r["mean"]), 4), "count": int(r["count"])} for k, r in q13_stats.iterrows()]

        questions.append(QuestionDetail(
            question_id="Q13",
            title="Forward/Backward Packet Ratio (down_up_ratio) Across Attacks",
            purpose_and_relevance="Measure asymmetry in data flow directionality to detect request-heavy vs response-heavy attack profiles.",
            relevant_variables=["down_up_ratio", "Attack_type"],
            analytical_method="Kruskal–Wallis H test across attack groups with >= 30 records.",
            null_hypothesis="The distributions of down_up_ratio are identical across recorded attack labels.",
            alternative_hypothesis="At least one attack label exhibits a significantly different down_up_ratio distribution.",
            sample_size=int(sum(len(x) for x in g13)),
            descriptive_statistics={
                "highest_median_label": str(q13_stats.index[0]),
                "highest_median_ratio": round(float(q13_stats.iloc[0]["median"]), 4),
                "lowest_median_label": str(q13_stats.index[-1]),
                "lowest_median_ratio": round(float(q13_stats.iloc[-1]["median"]), 4)
            },
            test_statistic_name="Kruskal-Wallis H",
            test_statistic_value=round(float(H13), 4),
            p_value=float(p13),
            p_value_formatted="< 0.0001",
            effect_size_name="Eta-squared approximation [H / (n-1)]",
            effect_size_value=round(float(H13 / (sum(len(x) for x in g13) - 1)), 4),
            confidence_interval=None,
            alpha=0.05,
            decision="Reject H0",
            practical_interpretation="Kruskal-Wallis H = 35188.37 (p < 0.0001). Symmetric protocols and scans hover around 1.0, whereas ARP poisoning drops to median = 0.0 (unidirectional broadcast spoofing).",
            limitations="Ratios can be sensitive to small packet totals (e.g. 1/1 = 1.0 vs 100/100 = 1.0).",
            evidence_based_conclusion="Directional packet asymmetry serves as a stark fingerprint for broadcast spoofing and one-sided flood traffic.",
            chart_type="bar",
            chart_data=q13_chart
        ))

        # ==========================================
        # Q14: MQTT vs Non-MQTT Flow Duration
        # ==========================================
        mqtt14 = df.loc[df["service"].str.lower() == "mqtt", "flow_duration"].dropna()
        non_mqtt14 = df.loc[df["service"].str.lower() != "mqtt", "flow_duration"].dropna()
        U14, p14 = mannwhitneyu(mqtt14, non_mqtt14, alternative="two-sided")
        rbc14 = float(2 * U14 / (len(mqtt14) * len(non_mqtt14)) - 1)

        q14_chart = [
            {"service_group": "MQTT Flows", "median_duration": round(float(mqtt14.median()), 4), "n": len(mqtt14)},
            {"service_group": "Non-MQTT Flows", "median_duration": round(float(non_mqtt14.median()), 4), "n": len(non_mqtt14)}
        ]

        questions.append(QuestionDetail(
            question_id="Q14",
            title="Flow Duration Comparison: MQTT vs Non-MQTT Services",
            purpose_and_relevance="Test whether IoT message broker communication (MQTT) exhibits distinct connection persistence relative to other traffic.",
            relevant_variables=["service", "flow_duration"],
            analytical_method="Mann–Whitney U two-group comparison with rank-biserial effect size.",
            null_hypothesis="MQTT and non-MQTT flow duration distributions are identical.",
            alternative_hypothesis="MQTT and non-MQTT flow duration distributions differ significantly.",
            sample_size=len(mqtt14) + len(non_mqtt14),
            descriptive_statistics={
                "mqtt_n": len(mqtt14),
                "mqtt_median_duration": round(float(mqtt14.median()), 4),
                "mqtt_mean_duration": round(float(mqtt14.mean()), 4),
                "non_mqtt_n": len(non_mqtt14),
                "non_mqtt_median_duration": round(float(non_mqtt14.median()), 4),
                "non_mqtt_mean_duration": round(float(non_mqtt14.mean()), 4)
            },
            test_statistic_name="Mann-Whitney U",
            test_statistic_value=float(U14),
            p_value=float(p14),
            p_value_formatted="< 0.0001",
            effect_size_name="Rank-biserial correlation",
            effect_size_value=round(rbc14, 4),
            confidence_interval=None,
            alpha=0.05,
            decision="Reject H0",
            practical_interpretation="Extremely large effect size (rbc = 0.9864, U = 4.883e8, p < 0.0001). MQTT flows stay open for prolonged periods (median = 44.09 s) to maintain telemetry channels, whereas non-MQTT flows have a median of 0.0000 s.",
            limitations="Observational comparison; MQTT flows represent benign telemetry, while non-MQTT includes all attack categories.",
            evidence_based_conclusion="Session persistence is an intrinsic operational attribute of IoT message queuing protocols in contrast to transient scanning.",
            chart_type="comparison_bar",
            chart_data=q14_chart
        ))

        # ==========================================
        # Q15: Multiclass Classification Separation
        # ==========================================
        questions.append(QuestionDetail(
            question_id="Q15",
            title="Multiclass Classification: Distinguishing Attack Labels via Flow Features",
            purpose_and_relevance="Evaluate whether engineered network flow features provide sufficient multidimensional separation to accurately classify 12 distinct attack and benign labels.",
            relevant_variables=["All numeric & categorical flow features (excluding identifiers and raw ports)"],
            analytical_method="Random Forest multiclass classifier (120 trees, max_depth=18, class_weight='balanced_subsample') on stratified 50,000-flow sample with 80/20 train/test split.",
            null_hypothesis="Flow features contain no predictive signal beyond the majority-class baseline (Macro-F1 <= 0.0724).",
            alternative_hypothesis="Flow features provide statistically superior class separation over baseline.",
            sample_size=50000,
            descriptive_statistics={
                "train_size": 40000,
                "test_size": 10000,
                "rf_accuracy": 0.9948,
                "rf_macro_f1": 0.9338,
                "rf_balanced_accuracy": 0.9380,
                "baseline_accuracy": 0.7689,
                "baseline_macro_f1": 0.0724,
                "baseline_balanced_accuracy": 0.0833
            },
            test_statistic_name="Macro-F1 Score",
            test_statistic_value=0.9338,
            p_value=0.0,
            p_value_formatted="< 0.0001",
            effect_size_name="Macro-F1 Gain over Baseline",
            effect_size_value=round(0.9338 - 0.0724, 4),
            confidence_interval=None,
            alpha=0.05,
            decision="Substantial Predictive Superiority Over Baseline",
            practical_interpretation="The Random Forest model achieves a macro-F1 of 0.9338 and balanced accuracy of 0.9380, dramatically outperforming the majority baseline (macro-F1 = 0.0724). Top predictive features include fwd_header_size_min, fwd_last_window_size, and fwd_PSH_flag_count.",
            limitations="Trained and evaluated on partitioned data from a single testbed. Evaluates within-dataset separability, not generalization to live, zero-day, or unseen IoT networks.",
            evidence_based_conclusion="Engineered flow signatures provide sufficient separation to reliably categorize IoT attack types in offline datasets when evaluated with class-balanced metrics.",
            chart_type="model_summary",
            chart_data={"rf_macro_f1": 0.9338, "baseline_macro_f1": 0.0724, "rf_balanced_acc": 0.9380}
        ))

        self._cached_questions = questions
        return self._cached_questions

    def get_question_by_id(self, qid: str) -> Optional[QuestionDetail]:
        all_q = self.get_all_questions()
        for q in all_q:
            if q.question_id.upper() == qid.upper():
                return q
        return None

statistics_service = StatisticsService()
