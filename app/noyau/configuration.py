from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "HR Coworking API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    UPLOAD_DOCUMENTS_DIR: str = "static/uploads/documents"
    UPLOAD_IMAGES_DIR: str = "static/images/espaces"
    HR_SKILLS_PAY_API_KEY: str = ""
    HR_SKILLS_PAY_BASE_URL: str = ""
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    FRONTEND_URL: str = "http://localhost:5173"
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
