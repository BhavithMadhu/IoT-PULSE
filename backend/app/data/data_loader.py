import logging
import duckdb
import numpy as np
import pandas as pd
from typing import Optional, Tuple, Dict, Any
from backend.app.config import settings

logger = logging.getLogger("iot_pulse.data_loader")

class DataLoader:
    _instance: Optional["DataLoader"] = None
    
    def __init__(self):
        self._raw_df: Optional[pd.DataFrame] = None
        self._df: Optional[pd.DataFrame] = None
        self._duckdb_conn: Optional[duckdb.DuckDBPyConnection] = None
        self._raw_audit: Dict[str, Any] = {}
        self._numeric_cols: list = []
        self._categorical_cols: list = []
        self._is_loaded: bool = False

    @classmethod
    def get_instance(cls) -> "DataLoader":
        if cls._instance is None:
            cls._instance = DataLoader()
        return cls._instance

    def load_data(self) -> None:
        if self._is_loaded:
            return

        logger.info(f"Loading dataset from: {settings.DATA_PATH}")
        if not settings.DATA_PATH.exists():
            raise FileNotFoundError(f"Source dataset not found at {settings.DATA_PATH}")

        raw = pd.read_csv(settings.DATA_PATH, low_memory=False)
        self._raw_df = raw

        # Record raw audit metrics
        raw_rows, raw_cols = raw.shape
        raw_dups = int(raw.duplicated().sum())
        missing_count = int(raw.isna().sum().sum())
        
        self._raw_audit = {
            "raw_rows": raw_rows,
            "raw_columns": raw_cols,
            "raw_duplicate_count": raw_dups,
            "total_missing_values": missing_count,
            "column_types": raw.dtypes.astype(str).value_counts().to_dict()
        }

        # Apply exact notebook preprocessing
        df = raw.copy()
        df.columns = [str(c).strip() for c in df.columns]

        for col in df.select_dtypes(include=["object", "string"]).columns:
            df[col] = df[col].astype("string").str.strip()

        raw_duplicate_count = int(df.duplicated().sum())
        df = df.drop_duplicates().copy()

        # Drop index-like columns
        index_like_cols = [c for c in df.columns if c.lower() in {"unnamed: 0", "index", "row_id"}]
        df = df.drop(columns=index_like_cols, errors="ignore")

        # Convert object columns to numeric if nearly all parse as numbers
        for col in df.columns:
            if col == "Attack_type":
                continue
            if df[col].dtype == "object" or str(df[col].dtype) == "string":
                parsed = pd.to_numeric(df[col], errors="coerce")
                nonmissing = df[col].notna().sum()
                if nonmissing and (parsed.notna().sum() / nonmissing) >= 0.98:
                    df[col] = parsed

        if "Attack_type" not in df.columns:
            raise ValueError("Attack_type column missing after cleaning.")

        df["Attack_type"] = df["Attack_type"].astype("string").str.strip()
        df = df.dropna(subset=["Attack_type"]).copy()

        # Clean infinities to NaN then fill if necessary
        self._numeric_cols = df.select_dtypes(include=np.number).columns.tolist()
        self._categorical_cols = [c for c in df.columns if c not in self._numeric_cols]

        self._df = df

        # Register in DuckDB
        logger.info("Initializing DuckDB in-memory analytical database...")
        conn = duckdb.connect(database=":memory:")
        conn.register("flows", df)
        self._duckdb_conn = conn

        self._is_loaded = True
        logger.info(f"Dataset successfully loaded. Analytical shape: {df.shape}")

    @property
    def df(self) -> pd.DataFrame:
        if not self._is_loaded:
            self.load_data()
        return self._df

    @property
    def duckdb_conn(self) -> duckdb.DuckDBPyConnection:
        if not self._is_loaded:
            self.load_data()
        return self._duckdb_conn

    @property
    def numeric_cols(self) -> list:
        if not self._is_loaded:
            self.load_data()
        return self._numeric_cols

    @property
    def categorical_cols(self) -> list:
        if not self._is_loaded:
            self.load_data()
        return self._categorical_cols

    @property
    def audit_info(self) -> Dict[str, Any]:
        if not self._is_loaded:
            self.load_data()
        return self._raw_audit

data_loader = DataLoader.get_instance()
