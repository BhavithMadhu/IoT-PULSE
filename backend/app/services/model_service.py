import logging
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.dummy import DummyClassifier
from sklearn.metrics import (
    accuracy_score, balanced_accuracy_score, f1_score,
    classification_report, confusion_matrix
)

from backend.app.config import settings
from backend.app.data.data_loader import data_loader
from backend.app.schemas.responses import (
    ModelMetricsResponse, ModelMetricRow, ConfusionMatrixData, FeatureImportanceItem
)

logger = logging.getLogger("iot_pulse.model_service")

class ModelService:
    def __init__(self):
        self.loader = data_loader
        self._cached_response: Optional[ModelMetricsResponse] = None
        self._cached_overview_metrics: Optional[Dict[str, float]] = None
        self._model_pipeline: Optional[Pipeline] = None

    def train_and_evaluate(self) -> ModelMetricsResponse:
        if self._cached_response is not None:
            return self._cached_response

        logger.info("Training and evaluating Random Forest classifier and baseline model...")
        df = self.loader.df

        exclude_predictors = {"Attack_type", "id.orig_p", "id.resp_p"}
        model_features = [c for c in df.columns if c not in exclude_predictors]
        model_data = df[model_features + ["Attack_type"]].replace([np.inf, -np.inf], np.nan).copy()

        # Stratified subsample to match notebook configuration
        max_rows = min(settings.ML_MAX_ROWS, len(model_data))
        if len(model_data) > max_rows:
            model_data, _ = train_test_split(
                model_data,
                train_size=max_rows,
                random_state=settings.ML_RANDOM_STATE,
                stratify=model_data["Attack_type"]
            )

        X = model_data[model_features]
        y = model_data["Attack_type"]

        usable_features = [c for c in X.columns if not X[c].isna().all()]
        X = X[usable_features]
        numeric_features = X.select_dtypes(include=np.number).columns.tolist()
        categorical_features = [c for c in X.columns if c not in numeric_features]

        # Train/test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=settings.ML_TEST_SIZE,
            random_state=settings.ML_RANDOM_STATE,
            stratify=y
        )

        # Transformers
        numeric_transformer = Pipeline(steps=[
            ("imputer", SimpleImputer(strategy="median"))
        ])
        categorical_transformer = Pipeline(steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore"))
        ])

        preprocessor = ColumnTransformer(
            transformers=[
                ("num", numeric_transformer, numeric_features),
                ("cat", categorical_transformer, categorical_features)
            ],
            remainder="drop"
        )

        rf = RandomForestClassifier(
            n_estimators=120,
            max_depth=18,
            min_samples_leaf=2,
            class_weight="balanced_subsample",
            random_state=settings.ML_RANDOM_STATE,
            n_jobs=-1
        )

        model = Pipeline(steps=[
            ("preprocess", preprocessor),
            ("classifier", rf)
        ])

        model.fit(X_train, y_train)
        pred = model.predict(X_test)
        self._model_pipeline = model

        # Majority class baseline
        baseline = DummyClassifier(strategy="most_frequent")
        baseline.fit(X_train, y_train)
        baseline_pred = baseline.predict(X_test)

        # Model metrics
        rf_acc = float(accuracy_score(y_test, pred))
        rf_bal_acc = float(balanced_accuracy_score(y_test, pred))
        rf_macro_f1 = float(f1_score(y_test, pred, average="macro", zero_division=0))
        rf_weighted_f1 = float(f1_score(y_test, pred, average="weighted", zero_division=0))

        base_acc = float(accuracy_score(y_test, baseline_pred))
        base_bal_acc = float(balanced_accuracy_score(y_test, baseline_pred))
        base_macro_f1 = float(f1_score(y_test, baseline_pred, average="macro", zero_division=0))
        base_weighted_f1 = float(f1_score(y_test, baseline_pred, average="weighted", zero_division=0))

        self._cached_overview_metrics = {
            "rf_accuracy": round(rf_acc, 4),
            "rf_balanced_accuracy": round(rf_bal_acc, 4),
            "rf_macro_f1": round(rf_macro_f1, 4),
            "baseline_macro_f1": round(base_macro_f1, 4)
        }

        metric_rows = [
            ModelMetricRow(
                model="Random Forest",
                accuracy=round(rf_acc, 4),
                balanced_accuracy=round(rf_bal_acc, 4),
                macro_F1=round(rf_macro_f1, 4),
                weighted_F1=round(rf_weighted_f1, 4)
            ),
            ModelMetricRow(
                model="Majority-class baseline",
                accuracy=round(base_acc, 4),
                balanced_accuracy=round(base_bal_acc, 4),
                macro_F1=round(base_macro_f1, 4),
                weighted_F1=round(base_weighted_f1, 4)
            )
        ]

        # Classification report dict
        clf_dict = classification_report(y_test, pred, output_dict=True, zero_division=0)
        formatted_clf = {}
        for k, v in clf_dict.items():
            if isinstance(v, dict):
                formatted_clf[k] = {
                    "precision": round(float(v.get("precision", 0)), 4),
                    "recall": round(float(v.get("recall", 0)), 4),
                    "f1_score": round(float(v.get("f1-score", 0)), 4),
                    "support": float(v.get("support", 0))
                }
            else:
                formatted_clf[k] = round(float(v), 4)

        # Confusion matrix
        labels = sorted(list(y.unique()))
        cm_norm = confusion_matrix(y_test, pred, labels=labels, normalize="true")
        cm_counts = confusion_matrix(y_test, pred, labels=labels)

        cm_data = ConfusionMatrixData(
            labels=labels,
            matrix_normalized=[[round(float(val), 4) for val in row] for row in cm_norm],
            matrix_counts=[[int(val) for val in row] for row in cm_counts]
        )

        # Feature importances
        top_importances = []
        try:
            rf_estimator = model.named_steps["classifier"]
            feature_names = model.named_steps["preprocess"].get_feature_names_out()
            raw_imp = pd.Series(rf_estimator.feature_importances_, index=feature_names).sort_values(ascending=False).head(25)
            for fname, imp_val in raw_imp.items():
                clean_name = str(fname).replace("num__", "").replace("cat__", "")
                top_importances.append(FeatureImportanceItem(
                    feature=clean_name,
                    importance=round(float(imp_val), 5)
                ))
        except Exception as e:
            logger.warning(f"Could not extract feature importances: {e}")

        # Model configuration metadata
        config_meta = {
            "algorithm": "RandomForestClassifier",
            "n_estimators": 120,
            "max_depth": 18,
            "min_samples_leaf": 2,
            "class_weight": "balanced_subsample",
            "random_state": settings.ML_RANDOM_STATE,
            "sample_size": max_rows,
            "train_size": len(X_train),
            "test_size": len(X_test),
            "excluded_features": list(exclude_predictors),
            "predictors_count": len(usable_features),
            "categorical_count": len(categorical_features),
            "numeric_count": len(numeric_features)
        }

        self._cached_response = ModelMetricsResponse(
            model_metrics=metric_rows,
            classification_report=formatted_clf,
            confusion_matrix=cm_data,
            top_feature_importance=top_importances,
            model_configuration=config_meta
        )

        return self._cached_response

    def get_overview_metrics(self) -> Dict[str, float]:
        if self._cached_overview_metrics is None:
            self.train_and_evaluate()
        return self._cached_overview_metrics or {}

model_service = ModelService()
