from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, extract, desc
from app.database import get_async_session
from app.models import EntrenoDB
from app.core import get_current_user

weekly_summary_router = APIRouter()

@weekly_summary_router.get("/weekly-summary")
async def weekly_summary(
    session: AsyncSession = Depends(get_async_session),
    user_id: int = Depends(get_current_user)
):
    year = extract('year', EntrenoDB.datahora).label('year')
    week = extract('week', EntrenoDB.datahora).label('week')

    result = await session.execute(
        select(
            year,
            week,
            func.count(EntrenoDB.entreno_id).label('total_entrenos'),
            func.coalesce(func.sum(EntrenoDB.pestotal), 0).label('peso_total'),
            func.coalesce(func.sum(
                (func.extract('hour', EntrenoDB.duraciototal) * 3600) +
                (func.extract('minute', EntrenoDB.duraciototal) * 60) +
                func.extract('second', EntrenoDB.duraciototal)
            ), 0).label('segundos_totales')
        )
        .where(EntrenoDB.usuari_id == user_id)
        .group_by(year, week)
        .order_by(desc(year), desc(week))
    )

    resumen = []
    for row in result:
        tiempo = int(row.segundos_totales)
        horas = tiempo // 3600
        minutos = (tiempo % 3600) // 60
        segundos = tiempo % 60
        resumen.append({
            "año": int(row.year),
            "semana": int(row.week),
            "total_entrenos": row.total_entrenos,
            "peso_total_levantado": float(row.peso_total),
            "tiempo_total_entrenado": f"{horas}h {minutos}m {segundos}s"
        })

    return {"resumen_semanal": resumen}
