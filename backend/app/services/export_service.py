import logging
from pathlib import Path
from typing import Optional, Dict, Any
import pandas as pd
from backend.app.config import settings
from backend.app.data.data_loader import data_loader
from backend.app.services.data_service import data_service
from backend.app.services.statistics_service import statistics_service
from backend.app.services.hypothesis_service import hypothesis_service
from backend.app.services.model_service import model_service

logger = logging.getLogger("iot_pulse.export_service")

class ExportService:
    def __init__(self):
        self.exports_dir = settings.EXPORTS_DIR
        self.exports_dir.mkdir(parents=True, exist_ok=True)

    def generate_all_exports(self) -> dict:
        logger.info(f"Generating all curated analytical tables into {self.exports_dir}...")
        generated_files = {}

        # 1. Clean Flows
        clean_df = data_loader.df
        clean_path = self.exports_dir / "iot_pulse_clean_flows.csv"
        clean_df.to_csv(clean_path, index=False)
        generated_files["iot_pulse_clean_flows"] = str(clean_path)

        # 2. AttackDistribution
        att_resp = data_service.get_attack_distribution()
        att_df = pd.DataFrame([item.model_dump() for item in att_resp.distribution])
        att_path = self.exports_dir / "AttackDistribution.csv"
        att_df.to_csv(att_path, index=False)
        generated_files["AttackDistribution"] = str(att_path)

        # 3. ProtocolDistribution
        proto_resp = data_service.get_protocol_distribution()
        proto_df = pd.DataFrame([item.model_dump() for item in proto_resp.distribution])
        proto_path = self.exports_dir / "ProtocolDistribution.csv"
        proto_df.to_csv(proto_path, index=False)
        generated_files["ProtocolDistribution"] = str(proto_path)

        # 4. ServiceDistribution
        srv_resp = data_service.get_service_distribution(top_n=50)
        srv_df = pd.DataFrame([item.model_dump() for item in srv_resp.distribution])
        srv_path = self.exports_dir / "ServiceDistribution.csv"
        srv_df.to_csv(srv_path, index=False)
        generated_files["ServiceDistribution"] = str(srv_path)

        # 5. FeatureSummary
        feat_resp = data_service.get_feature_summary()
        feat_df = pd.DataFrame([item.model_dump() for item in feat_resp.features])
        feat_path = self.exports_dir / "FeatureSummary.csv"
        feat_df.to_csv(feat_path, index=False)
        generated_files["FeatureSummary"] = str(feat_path)

        # 6. HypothesisTestResults
        hypo_resp = hypothesis_service.get_hypothesis_summary()
        hypo_df = pd.DataFrame([item.model_dump() for item in hypo_resp.tests])
        hypo_path = self.exports_dir / "HypothesisTestResults.csv"
        hypo_df.to_csv(hypo_path, index=False)
        generated_files["HypothesisTestResults"] = str(hypo_path)

        # 7. CorrelationResults
        corr_resp = statistics_service.get_correlation_matrix()
        corr_df = pd.DataFrame(corr_resp.matrix, index=corr_resp.features, columns=corr_resp.features)
        corr_path = self.exports_dir / "CorrelationResults.csv"
        corr_df.to_csv(corr_path)
        generated_files["CorrelationResults"] = str(corr_path)

        # 8. ModelMetrics
        ml_resp = model_service.train_and_evaluate()
        metrics_df = pd.DataFrame([item.model_dump() for item in ml_resp.model_metrics])
        metrics_path = self.exports_dir / "ModelMetrics.csv"
        metrics_df.to_csv(metrics_path, index=False)
        generated_files["ModelMetrics"] = str(metrics_path)

        # 9. ConfusionMatrix
        cm = ml_resp.confusion_matrix
        cm_df = pd.DataFrame(cm.matrix_normalized, index=cm.labels, columns=cm.labels)
        cm_path = self.exports_dir / "ConfusionMatrix.csv"
        cm_df.to_csv(cm_path)
        generated_files["ConfusionMatrix"] = str(cm_path)

        # 10. FeatureImportance
        imp_df = pd.DataFrame([item.model_dump() for item in ml_resp.top_feature_importance])
        imp_path = self.exports_dir / "FeatureImportance.csv"
        imp_df.to_csv(imp_path, index=False)
        generated_files["FeatureImportance"] = str(imp_path)

        logger.info(f"Successfully generated {len(generated_files)} analytical tables.")
        return generated_files

    def get_table_path(self, table_name: str) -> Optional[Path]:
        table_file = self.exports_dir / f"{table_name}.csv"
        if not table_file.exists():
            # Trigger generation
            self.generate_all_exports()
        return table_file if table_file.exists() else None

export_service = ExportService()
