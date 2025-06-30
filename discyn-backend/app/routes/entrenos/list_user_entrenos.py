from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.database import get_async_session
from app.models import EntrenoDB
from app.core import get_current_user

list_entrenos_router = APIRouter()

@list_entrenos_router.get("/all-user")
async def list_entrenos(
    session: AsyncSession = Depends(get_async_session),
    user_id: int = Depends(get_current_user),
    fecha_desde: Optional[datetime] = Query(None, description="Fecha desde (inclusive)"),
    fecha_hasta: Optional[datetime] = Query(None, description="Fecha hasta (inclusive)"),
    limit: int = Query(20, ge=1, le=100, description="Número máximo de entrenos a devolver"),
    offset: int = Query(0, ge=0, description="Número de entrenos a saltar")
):
    query = select(EntrenoDB).options(
        selectinload(EntrenoDB.rutina),
        selectinload(EntrenoDB.exercicis_entreno)
    ).where(EntrenoDB.usuari_id == user_id)
    
    if fecha_desde:
        query = query.where(EntrenoDB.datahora >= fecha_desde)
    if fecha_hasta:
        query = query.where(EntrenoDB.datahora <= fecha_hasta)

    query = query.order_by(EntrenoDB.datahora.desc()).limit(limit).offset(offset)

    result = await session.execute(query)
    entrenos = result.scalars().all()

    entrenos_list = []
    for entreno in entrenos:
        exercicis = [
            {
                "id": ex.id,
                "ordre": ex.ordre,
                "exercici_nom": ex.exercici_nom
            }
            for ex in sorted(entreno.exercicis_entreno, key=lambda e: e.ordre)
        ]

        entrenos_list.append({
            "entreno_id": entreno.entreno_id,
            "rutina_id": entreno.rutina_id,
            "rutina_nom": entreno.rutina.nom if entreno.rutina else None,
            "rutina_tipo": entreno.rutina.tipo if entreno.rutina else None,
            "pestotal": entreno.pestotal,
            "duraciototal": entreno.duraciototal.isoformat() if entreno.duraciototal else None,
            "sensacions": entreno.sensacions,
            "datahora": entreno.datahora.isoformat() if entreno.datahora else None,
            "recorregut": entreno.recorregut,
            "exercicis": exercicis
        })

    return {"entrenos": entrenos_list}
