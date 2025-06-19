from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from app.database import get_async_session
from app.models import EntrenoDB
from app.core import get_current_user

read_entreno_router = APIRouter()

@read_entreno_router.get("/get-top-user")
async def get_top_user(
    session: AsyncSession = Depends(get_async_session),
    id: int = Depends(get_current_user)
):
    result = await session.execute(select(EntrenoDB).where(EntrenoDB.usuari_id == id).order_by(desc(EntrenoDB.pestotal)))
    top_exercicis = result.scalars().fetchmany(10)

    if not top_exercicis:
        raise HTTPException(status_code=404, detail="There are no entrenos done by you")
    return top_exercicis