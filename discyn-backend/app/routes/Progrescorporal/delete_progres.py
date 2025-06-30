from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.models import ProgresCorporalDB
from app.core import get_current_user

delete_progrescorporal_router = APIRouter()

@delete_progrescorporal_router.delete("/delete/{progreso_id}")
async def delete_progreso_corporal(
    progreso_id: int,
    session: AsyncSession = Depends(get_async_session),
    user_id: int = Depends(get_current_user)
):
    result = await session.execute(
        select(ProgresCorporalDB).where(
            ProgresCorporalDB.id == progreso_id,
            ProgresCorporalDB.usuari_id == user_id
        )
    )
    progreso = result.scalar_one_or_none()
    if not progreso:
        raise HTTPException(status_code=404, detail="Registro de progreso corporal no encontrado")

    try:
        await session.delete(progreso)
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

    return {"message": "Registro de progreso corporal eliminado correctamente"}
