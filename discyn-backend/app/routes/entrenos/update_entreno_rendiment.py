from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete
from app.database import get_async_session
from app.models import EntrenoDB, SerieClassicaDB, SerieRendimentDB
from app.schemas.entreno import EntrenoUpdate
from datetime import time

update_entreno_rendiment_router = APIRouter()

@update_entreno_rendiment_router.put("/entrenos/rendiment/{entreno_id}")
async def update_entreno_rendiment(
    entreno_id: int,
    entreno_data: EntrenoUpdate,
    session: AsyncSession = Depends(get_async_session)
):
    db_entreno = await session.get(EntrenoDB, entreno_id)
    if not db_entreno:
        raise HTTPException(status_code=404, detail="Entreno no encontrado")

    if any(serie.tipus != "rendiment" for serie in entreno_data.series):
        raise HTTPException(status_code=400, detail="Las series deben ser todas de tipo 'rendiment'")

    # Solo actualizar duraciototal y sensacions, no pestotal
    db_entreno.duraciototal = time.fromisoformat(entreno_data.duraciototal)
    db_entreno.sensacions = entreno_data.sensacions

    ejercicir_ids = [s.exercicir_id for s in entreno_data.series]
    await session.execute(delete(SerieRendimentDB).where(SerieRendimentDB.exercicir_id.in_(ejercicir_ids)))

    for serie in entreno_data.series:
        for s in serie.dades:
            session.add(SerieRendimentDB(
                exercicir_id=serie.exercicir_id,
                num=s.num,
                temps=s.temps,
                distancia=s.distancia
            ))

    await session.commit()
    return {"message": "Entreno rendimiento actualizado correctamente"}

