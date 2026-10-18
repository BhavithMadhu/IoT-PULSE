import os
from pathlib import Path
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "IoT PULSE Cybersecurity Analytics API"
    PROJECT_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Path resolution
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_PATH: Path = Path(os.getenv("DATA_PATH", str(BASE_DIR / "RT_IOT2022.csv")))
    EXPORTS_DIR: Path = Path(os.getenv("EXPORTS_DIR", str(BASE_DIR / "exports")))
    
    # ML model parameters matching notebook
    ML_MAX_ROWS: int = int(os.getenv("ML_MAX_ROWS", "50000"))
    ML_RANDOM_STATE: int = 42
    ML_TEST_SIZE: float = 0.20
    
    # CORS
    CORS_ORIGINS: list = ["*"]

settings = Settings()
