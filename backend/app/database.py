from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.base import Base
from app.config import settings

engine = create_async_engine(settings.async_database_url, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

__all__ = ["Base", "engine", "AsyncSessionLocal"]


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
