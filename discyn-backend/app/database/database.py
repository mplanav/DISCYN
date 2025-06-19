from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import event
from typing import AsyncGenerator
from ..core import settings
import asyncio


class Base(DeclarativeBase):
    pass

engine = create_async_engine(settings.DATABASE_URL, echo=False)

"""
@event.listens_for(engine.sync_engine, "connect")
def set_search_path(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute('SET search_path TO practica')
    cursor.close()
"""
async_session = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session

async def init_db():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing the database: {e}")


if __name__ == "__main__":
    asyncio.run(init_db())