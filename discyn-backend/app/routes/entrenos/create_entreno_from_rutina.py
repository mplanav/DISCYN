from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_, and_
from sqlalchemy.future import select
from datetime import datetime, timedelta
from app.database import get_async_session
from app.models import (
    RutinaDB,
    EntrenoDB,
    ExerciciRealitzatDB,
    ExerciciEntrenoDB,
    GymbroDB
)
from app.core import get_current_user
from fastapi import Body
from app.schemas.create_entreno_from_rutina import EntrenoCreateFromRutinaIn


create_entreno_from_rutina_router = APIRouter()

@create_entreno_from_rutina_router.post("/create_from_rutina/{rutina_id}")
async def create_entreno_from_rutina(
    rutina_id: int,
    entreno_data: EntrenoCreateFromRutinaIn = Body(...),
    session: AsyncSession = Depends(get_async_session),
    user_id: int = Depends(get_current_user)
):
    # Obtener gymbros
    gymbro_result = await session.execute(
        select(GymbroDB).where(
            or_(
                GymbroDB.usuari1_id == user_id,
                GymbroDB.usuari2_id == user_id
            )
        )
    )
    gymbro_pairs = gymbro_result.scalars().all()
    gymbro_ids = [
        g.usuari2_id if g.usuari1_id == user_id else g.usuari1_id
        for g in gymbro_pairs
    ]

    # Validar rutina
    result = await session.execute(
        select(RutinaDB).where(
            and_(
                RutinaDB.id == rutina_id,
                or_(
                    RutinaDB.user_id == user_id,
                    RutinaDB.admin_id.isnot(None),
                    RutinaDB.user_id.in_(gymbro_ids)
                )
            )
        )
    )
    rutina = result.scalar_one_or_none()
    if not rutina:
        raise HTTPException(status_code=404, detail="Rutina no encontrada o no autorizada")

    # Crear entreno
    new_entreno = EntrenoDB(
        usuari_id=user_id,
        rutina_id=rutina_id,
        pestotal=entreno_data.pestotal or 0.0,
        duraciototal=entreno_data.duraciototal or (datetime.min + timedelta(minutes=0)).time(),
        sensacions=entreno_data.sensacions or "",
        datahora=entreno_data.datahora or datetime.now(),
        recorregut=entreno_data.recorregut
    )
    session.add(new_entreno)
    await session.flush()

    # Copiar ejercicios
    result_exercicis = await session.execute(
        select(ExerciciRealitzatDB).where(ExerciciRealitzatDB.rutina_id == rutina_id)
    )
    exercicis_rutina = result_exercicis.scalars().all()

    for exercici in exercicis_rutina:
        session.add(
            ExerciciEntrenoDB(
                ordre=exercici.ordre,
                entreno_id=new_entreno.entreno_id,
                exercici_nom=exercici.exercici_nom
            )
        )

    await session.commit()

    return {
        "message": "Entreno creado con éxito a partir de la rutina",
        "entreno_id": new_entreno.entreno_id,
        "rutina_tipo": rutina.tipo
    }