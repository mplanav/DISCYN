from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Discyn"
    VERSION: str = "1.0.0"

    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    
    LOG_LEVEL: str = "WARNING"

    UPLOAD_DIR: str = "static/images/"
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()