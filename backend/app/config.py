from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://ota:ota_secret@localhost:5432/ota_worldmap"
    async_database_url: str = "postgresql+asyncpg://ota:ota_secret@localhost:5432/ota_worldmap"

    class Config:
        env_file = ".env"


settings = Settings()
