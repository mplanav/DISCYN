from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.models import ProgresCorporalDB
from app.core import get_current_user

get_progrescorporal_router = APIRouter()

@get_progrescorporal_router.get("/get/{progreso_id}")
async def get_progreso_corporal(
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

    return {
        "id": progreso.id,
        "peso": progreso.peso,
        "cintura": progreso.cintura,
        "pecho": progreso.pecho,
        "brazo": progreso.brazo,
        "imc": progreso.imc,
        "grasa_corporal": progreso.grasa_corporal,
        "masa_muscular": progreso.masa_muscular,
        "fecha": progreso.fecha.isoformat() if progreso.fecha else None
    }
