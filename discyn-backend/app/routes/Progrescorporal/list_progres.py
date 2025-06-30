from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.database import get_async_session
from app.models import ProgresCorporalDB
from app.core import get_current_user

list_progrescorporal_router = APIRouter()

@list_progrescorporal_router.get("/all")
async def list_progrescorporal(
    session: AsyncSession = Depends(get_async_session),
    user_id: int = Depends(get_current_user)
):
    result = await session.execute(
        select(ProgresCorporalDB)
        .where(ProgresCorporalDB.usuari_id == user_id)
        .order_by(ProgresCorporalDB.fecha.desc())
    )
    progresos = result.scalars().all()

    progresos_list = []
    for p in progresos:
        progresos_list.append({
            "id": p.id,
            "peso": p.peso,
            "cintura": p.cintura,
            "pecho": p.pecho,
            "brazo": p.brazo,
            "imc": p.imc,
            "grasa_corporal": p.grasa_corporal,
            "masa_muscular": p.masa_muscular,
            "fecha": p.fecha.isoformat() if p.fecha else None
        })

    return {"progresos": progresos_list}

