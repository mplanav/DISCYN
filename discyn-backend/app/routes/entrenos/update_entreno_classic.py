from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete
from app.database import get_async_session
from app.models import EntrenoDB, SerieClassicaDB, SerieRendimentDB
from app.schemas.entreno import EntrenoUpdate
from datetime import time

update_entreno_classic_router = APIRouter()

@update_entreno_classic_router.put("/entrenos/classica/{entreno_id}")
async def update_entreno_classica(
    entreno_id: int,
    entreno_data: EntrenoUpdate,
    session: AsyncSession = Depends(get_async_session)
):
    db_entreno = await session.get(EntrenoDB, entreno_id)
    if not db_entreno:
        raise HTTPException(status_code=404, detail="Entreno no encontrado")

    # Validar que todas las series sean 'classica'
    if any(serie.tipus != "classica" for serie in entreno_data.series):
        raise HTTPException(status_code=400, detail="Las series deben ser todas de tipo 'classica'")

    # Actualizar datos
    db_entreno.pestotal = entreno_data.pestotal
    db_entreno.duraciototal = time.fromisoformat(entreno_data.duraciototal)
    db_entreno.sensacions = entreno_data.sensacions

    ejercicir_ids = [s.exercicir_id for s in entreno_data.series]
    await session.execute(delete(SerieClassicaDB).where(SerieClassicaDB.exercicir_id.in_(ejercicir_ids)))

    for serie in entreno_data.series:
        for s in serie.dades:
            session.add(SerieClassicaDB(
                exercicir_id=serie.exercicir_id,
                num=s.num,
                pes=s.pes,
                repeticions=s.repeticions,
                tipus="classica"
            ))

    await session.commit()
    return {"message": "Entreno hipertrofia actualizado correctamente"}

