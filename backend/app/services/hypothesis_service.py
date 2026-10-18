import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from scipy.stats import chi2_contingency, kruskal, mannwhitneyu, spearmanr
from statsmodels.stats.proportion import proportions_ztest
from statsmodels.stats.multitest import multipletests

from backend.app.data.data_loader import data_loader
from backend.app.schemas.responses import HypothesisSummaryResponse, HypothesisTestItem

class HypothesisService:
    def __init__(self):
        self.loader = data_loader
        self._cached_summary: Optional[HypothesisSummaryResponse] = None

    def get_hypothesis_summary(self) -> HypothesisSummaryResponse:
        if self._cached_summary is not None:
            return self._cached_summary

        df = self.loader.df
        inferential_rows = []

        def add_test(question, method, stat_name, statistic, p_value, n, effect_name=None, effect_value=None, note=""):
            inferential_rows.append({
                "question": question,
                "test": method,
                "statistic_name": stat_name,
                "statistic": float(statistic),
                "p_value": float(p_value),
                "n": int(n),
                "effect_name": effect_name,
                "effect_value": round(float(effect_value), 4) if effect_value is not None and not np.isnan(effect_value) else None,
                "notes": note
            })

        # 1. Q2: Protocol x Attack
        if {"proto", "Attack_type"}.issubset(df.columns):
            ct = pd.crosstab(df["proto"], df["Attack_type"])
            chi2, p, _, _ = chi2_contingency(ct)
            v = float(np.sqrt(chi2 / (len(df) * (min(ct.shape) - 1))))
            add_test("Q2 Protocol × attack label", "Chi-square independence", "Chi-square (χ²)", chi2, p, len(df), "Cramer's V", v)

        # 2. Q3: Service x Attack
        if {"service", "Attack_type"}.issubset(df.columns):
            srv_counts = df["service"].value_counts()
            top = srv_counts[srv_counts >= 100].index
            grouped = df["service"].where(df["service"].isin(top), "Other service")
            ct = pd.crosstab(grouped, df["Attack_type"])
            chi2, p, _, _ = chi2_contingency(ct)
            v = float(np.sqrt(chi2 / (len(df) * (min(ct.shape) - 1))))
            add_test("Q3 Service group × attack label", "Chi-square independence", "Chi-square (χ²)", chi2, p, len(df), "Cramer's V", v,
                     "Infrequent services (<100 records) collapsed into 'Other'")

        # 3. Kruskal-Wallis tests across attack labels
        # Q4 Flow duration
        g4 = [g["flow_duration"].dropna().to_numpy() for _, g in df.groupby("Attack_type") if len(g["flow_duration"].dropna()) >= 30]
        if len(g4) >= 2:
            h, p = kruskal(*g4)
            add_test("Q4 Flow duration by attack label", "Kruskal–Wallis", "H-statistic", h, p, sum(len(x) for x in g4),
                     "Eta-squared (approx)", h / (sum(len(x) for x in g4) - 1), f"Labels with n>=30: {len(g4)} groups")

        # Q5 Total packets
        total_pkts = (df["fwd_pkts_tot"] + df["bwd_pkts_tot"]).dropna()
        g5 = [g.to_numpy() for _, g in total_pkts.groupby(df["Attack_type"]) if len(g) >= 30]
        if len(g5) >= 2:
            h, p = kruskal(*g5)
            add_test("Q5 Total packets by attack label", "Kruskal–Wallis", "H-statistic", h, p, sum(len(x) for x in g5),
                     "Eta-squared (approx)", h / (sum(len(x) for x in g5) - 1), f"Labels with n>=30: {len(g5)} groups")

        # Q9 SYN flags
        g9 = [g["flow_SYN_flag_count"].dropna().to_numpy() for _, g in df.groupby("Attack_type") if len(g["flow_SYN_flag_count"].dropna()) >= 30]
        if len(g9) >= 2:
            h, p = kruskal(*g9)
            add_test("Q9 SYN flags by attack label", "Kruskal–Wallis", "H-statistic", h, p, sum(len(x) for x in g9),
                     "Eta-squared (approx)", h / (sum(len(x) for x in g9) - 1), f"Labels with n>=30: {len(g9)} groups")

        # Q13 down_up_ratio
        g13 = [g["down_up_ratio"].dropna().to_numpy() for _, g in df.groupby("Attack_type") if len(g["down_up_ratio"].dropna()) >= 30]
        if len(g13) >= 2:
            h, p = kruskal(*g13)
            add_test("Q13 Directional ratio by attack label", "Kruskal–Wallis", "H-statistic", h, p, sum(len(x) for x in g13),
                     "Eta-squared (approx)", h / (sum(len(x) for x in g13) - 1), f"Labels with n>=30: {len(g13)} groups")

        # 4. Q10 High-SYN proportions
        thresh10 = df["flow_SYN_flag_count"].quantile(0.75)
        tmp10 = df[["Attack_type", "flow_SYN_flag_count"]].dropna().copy()
        tmp10["high_syn"] = (tmp10["flow_SYN_flag_count"] > thresh10).astype(int)
        h_dos = tmp10.loc[tmp10["Attack_type"] == "DOS_SYN_Hping", "high_syn"]
        h_oth = tmp10.loc[tmp10["Attack_type"] != "DOS_SYN_Hping", "high_syn"]
        count10 = np.array([h_dos.sum(), h_oth.sum()])
        nobs10 = np.array([len(h_dos), len(h_oth)])
        z10, p10 = proportions_ztest(count10, nobs10)
        p_diff = float(h_dos.mean() - h_oth.mean())
        add_test("Q10 High-SYN DOS_SYN_Hping vs Other", "Two-proportion z-test", "z-statistic", z10, p10, len(tmp10),
                 "Difference in proportions", p_diff, "Observational comparison, not randomized A/B test")

        # 5. Correlations
        # Q6
        rho6, p6 = spearmanr(df["fwd_pkts_tot"], df["bwd_pkts_tot"])
        add_test("Q6 Fwd vs bwd packet correlation", "Spearman correlation", "Spearman rho", rho6, p6, len(df), "Spearman rho", rho6)

        # Q11
        pair11 = df[["flow_duration", "flow_pkts_per_sec"]].replace([np.inf, -np.inf], np.nan).dropna()
        rho11, p11 = spearmanr(pair11["flow_duration"], pair11["flow_pkts_per_sec"])
        add_test("Q11 Duration vs packet rate", "Spearman correlation", "Spearman rho", rho11, p11, len(pair11), "Spearman rho", rho11)

        # 6. Two-group protocol comparisons
        # Q7
        tcp7 = df.loc[df["proto"].str.lower() == "tcp", "flow_pkts_per_sec"].dropna()
        udp7 = df.loc[df["proto"].str.lower() == "udp", "flow_pkts_per_sec"].dropna()
        u7, p7 = mannwhitneyu(tcp7, udp7, alternative="two-sided")
        rbc7 = 2 * u7 / (len(tcp7) * len(udp7)) - 1
        add_test("Q7 TCP vs UDP packet rate", "Mann–Whitney U", "U-statistic", u7, p7, len(tcp7) + len(udp7),
                 "Rank-biserial correlation", rbc7, f"TCP n={len(tcp7):,}; UDP n={len(udp7):,}")

        # Q8
        tcp8 = df.loc[df["proto"].str.lower() == "tcp", "payload_bytes_per_second"].dropna()
        udp8 = df.loc[df["proto"].str.lower() == "udp", "payload_bytes_per_second"].dropna()
        u8, p8 = mannwhitneyu(tcp8, udp8, alternative="two-sided")
        rbc8 = 2 * u8 / (len(tcp8) * len(udp8)) - 1
        add_test("Q8 TCP vs UDP payload rate", "Mann–Whitney U", "U-statistic", u8, p8, len(tcp8) + len(udp8),
                 "Rank-biserial correlation", rbc8, f"TCP n={len(tcp8):,}; UDP n={len(udp8):,}")

        # Q14
        mqtt14 = df.loc[df["service"].str.lower() == "mqtt", "flow_duration"].dropna()
        non_mqtt14 = df.loc[df["service"].str.lower() != "mqtt", "flow_duration"].dropna()
        u14, p14 = mannwhitneyu(mqtt14, non_mqtt14, alternative="two-sided")
        rbc14 = 2 * u14 / (len(mqtt14) * len(non_mqtt14)) - 1
        add_test("Q14 MQTT vs non-MQTT duration", "Mann–Whitney U", "U-statistic", u14, p14, len(mqtt14) + len(non_mqtt14),
                 "Rank-biserial correlation", rbc14, f"MQTT n={len(mqtt14):,}; non-MQTT n={len(non_mqtt14):,}")

        # Benjamini-Hochberg adjustment
        res_df = pd.DataFrame(inferential_rows)
        raw_p = res_df["p_value"].clip(lower=np.finfo(float).tiny).to_numpy()
        _, p_adj_bh, _, _ = multipletests(raw_p, method="fdr_bh")
        res_df["p_value_adjusted_BH"] = p_adj_bh
        res_df["significant_raw_005"] = res_df["p_value"] < 0.05
        res_df["significant_BH_005"] = res_df["p_value_adjusted_BH"] < 0.05

        items: List[HypothesisTestItem] = []
        for _, row in res_df.iterrows():
            items.append(HypothesisTestItem(
                question=str(row["question"]),
                test=str(row["test"]),
                statistic_name=str(row["statistic_name"]),
                statistic=round(float(row["statistic"]), 4),
                p_value=float(row["p_value"]),
                p_value_adjusted_BH=float(row["p_value_adjusted_BH"]),
                n=int(row["n"]),
                effect_name=str(row["effect_name"]) if row["effect_name"] else None,
                effect_value=round(float(row["effect_value"]), 4) if row["effect_value"] is not None and not np.isnan(row["effect_value"]) else None,
                significant_raw_005=bool(row["significant_raw_005"]),
                significant_BH_005=bool(row["significant_BH_005"]),
                notes=str(row["notes"])
            ))

        self._cached_summary = HypothesisSummaryResponse(
            total_tests=len(items),
            significant_raw_count=int(res_df["significant_raw_005"].sum()),
            significant_bh_count=int(res_df["significant_BH_005"].sum()),
            tests=items
        )
        return self._cached_summary

hypothesis_service = HypothesisService()
