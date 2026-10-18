import math
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from backend.app.data.data_loader import data_loader
from backend.app.schemas.filters import FlowFilterParams
from backend.app.schemas.responses import (
    OverviewResponse, AttackDistributionResponse, AttackDistributionItem,
    ProtocolDistributionResponse, ProtocolDistributionItem,
    ServiceDistributionResponse, ServiceDistributionItem,
    FeatureSummaryResponse, FeatureSummaryItem,
    ExplorerResponse
)

NORMAL_LABELS = {"Thing_Speak", "MQTT_Publish", "Wipro_bulb"}

class DataService:
    def __init__(self):
        self.loader = data_loader

    def get_overview(self, rf_metrics: Optional[Dict[str, Any]] = None) -> OverviewResponse:
        df = self.loader.df
        total_records = len(df)
        labels_count = df["Attack_type"].nunique()

        is_normal = df["Attack_type"].isin(NORMAL_LABELS)
        normal_count = int(is_normal.sum())
        normal_pct = round((normal_count / total_records) * 100, 3)

        malicious_count = total_records - normal_count
        malicious_pct = round((malicious_count / total_records) * 100, 3)

        val_counts = df["Attack_type"].value_counts()
        majority_label = str(val_counts.index[0])
        majority_pct = round((val_counts.iloc[0] / total_records) * 100, 3)

        least_label = str(val_counts.index[-1])
        least_pct = round((val_counts.iloc[-1] / total_records) * 100, 3)

        numeric_count = len(self.loader.numeric_cols)
        categorical_count = len(self.loader.categorical_cols)

        rf_macro_f1 = None
        rf_balanced_acc = None
        rf_acc = None
        base_macro_f1 = None
        if rf_metrics:
            rf_macro_f1 = rf_metrics.get("rf_macro_f1")
            rf_balanced_acc = rf_metrics.get("rf_balanced_accuracy")
            rf_acc = rf_metrics.get("rf_accuracy")
            base_macro_f1 = rf_metrics.get("baseline_macro_f1")

        return OverviewResponse(
            total_records=total_records,
            attack_labels_count=labels_count,
            normal_traffic_count=normal_count,
            normal_traffic_percentage=normal_pct,
            malicious_traffic_count=malicious_count,
            malicious_traffic_percentage=malicious_pct,
            majority_attack_label=majority_label,
            majority_attack_percentage=majority_pct,
            least_represented_label=least_label,
            least_represented_percentage=least_pct,
            numeric_features_count=numeric_count,
            categorical_features_count=categorical_count,
            rf_macro_f1=rf_macro_f1,
            rf_balanced_accuracy=rf_balanced_acc,
            rf_accuracy=rf_acc,
            baseline_macro_f1=base_macro_f1
        )

    def get_attack_distribution(self) -> AttackDistributionResponse:
        df = self.loader.df
        total_records = len(df)
        vc = df["Attack_type"].value_counts()

        items = []
        for label, count in vc.items():
            items.append(AttackDistributionItem(
                attack_type=str(label),
                record_count=int(count),
                percentage=round((count / total_records) * 100, 3),
                is_normal=(str(label) in NORMAL_LABELS)
            ))

        return AttackDistributionResponse(
            total_records=total_records,
            distribution=items
        )

    def get_protocol_distribution(self) -> ProtocolDistributionResponse:
        df = self.loader.df
        total_records = len(df)
        vc = df["proto"].value_counts()

        items = []
        for proto, count in vc.items():
            items.append(ProtocolDistributionItem(
                proto=str(proto),
                record_count=int(count),
                percentage=round((count / total_records) * 100, 3)
            ))

        return ProtocolDistributionResponse(
            total_records=total_records,
            distribution=items
        )

    def get_service_distribution(self, top_n: int = 20) -> ServiceDistributionResponse:
        df = self.loader.df
        total_records = len(df)
        vc = df["service"].value_counts()

        items = []
        for service, count in vc.head(top_n).items():
            items.append(ServiceDistributionItem(
                service=str(service),
                record_count=int(count),
                percentage=round((count / total_records) * 100, 3)
            ))

        return ServiceDistributionResponse(
            total_records=total_records,
            distribution=items
        )

    def get_feature_summary(self) -> FeatureSummaryResponse:
        df = self.loader.df
        num_cols = self.loader.numeric_cols

        items = []
        for col in num_cols:
            series = df[col].dropna()
            count = int(series.count())
            if count == 0:
                continue

            q1 = float(series.quantile(0.25))
            median = float(series.median())
            q3 = float(series.quantile(0.75))
            iqr = q3 - q1
            low_fence = q1 - 1.5 * iqr
            high_fence = q3 + 1.5 * iqr

            outlier_mask = (series < low_fence) | (series > high_fence)
            outlier_count = int(outlier_mask.sum())
            outlier_pct = round((outlier_count / count) * 100, 3)

            items.append(FeatureSummaryItem(
                feature=col,
                dtype=str(series.dtype),
                count=count,
                mean=round(float(series.mean()), 4),
                std=round(float(series.std()), 4) if count > 1 else 0.0,
                min=round(float(series.min()), 4),
                q25=round(q1, 4),
                median=round(median, 4),
                q75=round(q3, 4),
                max=round(float(series.max()), 4),
                iqr=round(iqr, 4),
                outlier_count=outlier_count,
                outlier_percentage=outlier_pct
            ))

        return FeatureSummaryResponse(
            total_features=len(items),
            features=items
        )

    def explore_flows(self, params: FlowFilterParams) -> ExplorerResponse:
        conn = self.loader.duckdb_conn
        df = self.loader.df
        total_records = len(df)

        where_clauses = ["1=1"]
        query_params = []

        if params.attack_type:
            where_clauses.append("Attack_type = ?")
            query_params.append(params.attack_type)
        if params.proto:
            where_clauses.append("LOWER(proto) = LOWER(?)")
            query_params.append(params.proto)
        if params.service:
            where_clauses.append("LOWER(service) = LOWER(?)")
            query_params.append(params.service)

        where_sql = " AND ".join(where_clauses)

        # Count filtered records
        count_query = f"SELECT COUNT(*) FROM flows WHERE {where_sql}"
        filtered_records = conn.execute(count_query, query_params).fetchone()[0]

        # Determine columns
        valid_cols = list(df.columns)
        if params.columns:
            requested = [c.strip() for c in params.columns.split(",") if c.strip() in valid_cols]
            select_cols = requested if requested else valid_cols[:15]
        else:
            # Default subset of interesting columns
            default_cols = [
                "Attack_type", "proto", "service", "flow_duration",
                "fwd_pkts_tot", "bwd_pkts_tot", "flow_pkts_per_sec",
                "payload_bytes_per_second", "flow_SYN_flag_count",
                "flow_ACK_flag_count", "down_up_ratio"
            ]
            select_cols = [c for c in default_cols if c in valid_cols]

        # Sorting validation
        sort_col = params.sort_by if params.sort_by in valid_cols else "flow_duration"
        sort_order = "DESC" if params.sort_order.lower() == "desc" else "ASC"

        # Bounded pagination
        offset = (params.page - 1) * params.page_size
        escaped_cols = ", ".join([f'"{c}"' for c in select_cols])
        data_query = f"""
            SELECT {escaped_cols}
            FROM flows
            WHERE {where_sql}
            ORDER BY "{sort_col}" {sort_order}
            LIMIT {params.page_size} OFFSET {offset}
        """

        result_df = conn.execute(data_query, query_params).df()
        
        # Replace NaN / inf with None for valid JSON serialization
        result_df = result_df.replace([np.inf, -np.inf], None)
        result_df = result_df.where(pd.notnull(result_df), None)
        records = result_df.to_dict(orient="records")

        # Summary statistics for numeric columns in selected set
        num_in_select = [c for c in select_cols if c in self.loader.numeric_cols]
        summary_stats = {}
        if num_in_select and filtered_records > 0:
            agg_exprs = []
            for c in num_in_select[:5]:
                agg_exprs.append(f'AVG("{c}") as "{c}_avg"')
                agg_exprs.append(f'MIN("{c}") as "{c}_min"')
                agg_exprs.append(f'MAX("{c}") as "{c}_max"')
            if agg_exprs:
                agg_sql = f"SELECT {', '.join(agg_exprs)} FROM flows WHERE {where_sql}"
                stats_row = conn.execute(agg_sql, query_params).df().iloc[0]
                for c in num_in_select[:5]:
                    summary_stats[c] = {
                        "avg": round(float(stats_row.get(f"{c}_avg", 0) or 0), 4),
                        "min": round(float(stats_row.get(f"{c}_min", 0) or 0), 4),
                        "max": round(float(stats_row.get(f"{c}_max", 0) or 0), 4)
                    }

        total_pages = max(1, math.ceil(filtered_records / params.page_size))

        return ExplorerResponse(
            total_records=total_records,
            filtered_records=filtered_records,
            page=params.page,
            page_size=params.page_size,
            total_pages=total_pages,
            columns=select_cols,
            numeric_columns=self.loader.numeric_cols,
            categorical_columns=self.loader.categorical_cols,
            records=records,
            summary_stats=summary_stats
        )

data_service = DataService()
