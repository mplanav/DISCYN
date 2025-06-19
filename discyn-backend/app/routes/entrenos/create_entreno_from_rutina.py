from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta
from app.database import get_async_session
from app.models import RutinaDB, HipertrofiaDB, EntrenoDB, ExerciciRealitzatDB
from app.core import get_current_user

create_entreno_from_rutina_router = APIRouter()

@create_entreno_from_rutina_router.post("/create_from_rutina/{rutina_id}")
async def create_entreno_from_rutina(
    rutina_id: int,
    session: AsyncSession = Depends(get_async_session),
    user_id: int = Depends(get_current_user)
):
    # Buscar rutina
    result = await session.execute(select(RutinaDB).where(RutinaDB.id == rutina_id))
    rutina = result.scalars().first()
    if not rutina:
        raise HTTPException(status_code=404, detail="Rutina not found")

    # Buscar si hay ejercicios de hipertrofia
    result_hipertrofia = await session.execute(
        select(HipertrofiaDB)
        .join(ExerciciRealitzatDB, HipertrofiaDB.exercicir_id == ExerciciRealitzatDB.id)
        .where(ExerciciRealitzatDB.rutina_id == rutina_id)
    )
    hipertrofia = result_hipertrofia.scalars().first()

    tipo_rutina = "classica" if hipertrofia else "rendiment"

    # Crear entreno
    new_entreno = EntrenoDB(
        usuari_id=user_id,
        rutina_id=rutina_id,
        pestotal=0.0,
        duraciototal=(datetime.min + timedelta(minutes=0)).time(),
        sensacions="",
        datahora=datetime.now()
    )
    session.add(new_entreno)
    await session.commit()
    await session.refresh(new_entreno)

    return {
        "message": "Entreno creado con éxito a partir de la rutina",
        "entreno_id": new_entreno.entreno_id,
        "tipo_rutina": tipo_rutina
    }
