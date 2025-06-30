from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import timedelta
from app.database import get_async_session
from app.models import EntrenoDB
from app.core import get_current_user

stats_router = APIRouter()

@stats_router.get("/stats")
async def user_entrenos_stats(
    session: AsyncSession = Depends(get_async_session),
    user_id: int = Depends(get_current_user)
):
    # Query para obtener count, sum(pestotal), sum(duraciototal)
    result = await session.execute(
        select(
            func.count(EntrenoDB.entreno_id),
            func.coalesce(func.sum(EntrenoDB.pestotal), 0.0)
        )
        .where(EntrenoDB.usuari_id == user_id)
    )
    total_entrenos, total_peso = result.one()

    # Para tiempo total entrenado (duraciototal es Time)
    # Necesitamos sumar las duraciones (horas, minutos, segundos) de cada entreno

    result_times = await session.execute(
        select(EntrenoDB.duraciototal)
        .where(EntrenoDB.usuari_id == user_id)
    )
    tiempos = result_times.scalars().all()

    total_segundos = 0
    for t in tiempos:
        if t:
            total_segundos += t.hour * 3600 + t.minute * 60 + t.second

    tiempo_total = str(timedelta(seconds=total_segundos))

    return {
        "total_entrenos": total_entrenos,
        "peso_total_levantado": total_peso,
        "tiempo_total_entrenado": tiempo_total
    }
