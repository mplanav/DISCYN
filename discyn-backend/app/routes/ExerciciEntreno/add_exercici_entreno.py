from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.models import EntrenoDB, ExerciciDB, ExerciciEntrenoDB
from app.core import get_current_user

add_exercise_router = APIRouter()

@add_exercise_router.post("/{entreno_id}/add")
async def add_exercise_to_entreno(
    entreno_id: int,
    exercici_nom: str = Form(...),
    ordre: int = Form(...),
    session: AsyncSession = Depends(get_async_session),
    user_id: int = Depends(get_current_user)
):
    # Validar entreno
    result = await session.execute(
        select(EntrenoDB).where(EntrenoDB.entreno_id == entreno_id)
    )
    entreno = result.scalar_one_or_none()

    if not entreno:
        raise HTTPException(status_code=404, detail="Entreno no encontrado")
    if entreno.usuari_id != user_id:
        raise HTTPException(status_code=403, detail="No autorizado para este entreno")

    # Validar que exista el ejercicio en la tabla de ejercicios
    result_ex = await session.execute(
        select(ExerciciDB).where(ExerciciDB.nom == exercici_nom)
    )
    exercici = result_ex.scalar_one_or_none()

    if not exercici:
        raise HTTPException(status_code=404, detail="El ejercicio no existe")

    # Validar unicidad de ordre en este entreno
    result_check = await session.execute(
        select(ExerciciEntrenoDB)
        .where(
            ExerciciEntrenoDB.entreno_id == entreno_id,
            ExerciciEntrenoDB.ordre == ordre
        )
    )
    existing = result_check.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un ejercicio con ese orden en este entreno")

    # Crear el nuevo ExerciciEntreno
    nou_exercici_entreno = ExerciciEntrenoDB(
        entreno_id=entreno_id,
        exercici_nom=exercici_nom,
        ordre=ordre
    )

    session.add(nou_exercici_entreno)
    try:
        await session.commit()
        await session.refresh(nou_exercici_entreno)
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "message": "Ejercicio añadido correctamente al entreno",
        "exercise_entreno_id": nou_exercici_entreno.id
    }
