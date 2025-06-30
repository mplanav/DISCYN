from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.models import EntrenoDB, ExerciciEntrenoDB, ExerciciDB
from app.core import get_current_user

edit_exercise_router = APIRouter()

class ExerciseUpdateSchema(BaseModel):
    ordre: int | None = Field(None, description="Nuevo orden del ejercicio")
    exercici_nom: str | None = Field(None, description="Nuevo nombre del ejercicio")

@edit_exercise_router.patch("/entreno/{entreno_id}/exercise/{exercise_entreno_id}")
async def update_exercise_in_entreno(
    entreno_id: int,
    exercise_entreno_id: int,
    exercise_update: ExerciseUpdateSchema,
    session: AsyncSession = Depends(get_async_session),
    user_id: int = Depends(get_current_user)
):
    # Verificar entreno
    result_entreno = await session.execute(
        select(EntrenoDB).where(EntrenoDB.entreno_id == entreno_id)
    )
    entreno = result_entreno.scalar_one_or_none()
    if not entreno:
        raise HTTPException(status_code=404, detail="Entreno no encontrado")
    if entreno.usuari_id != user_id:
        raise HTTPException(status_code=403, detail="No autorizado para este entreno")

    # Verificar ejercicio dentro del entreno
    result_exercise = await session.execute(
        select(ExerciciEntrenoDB).where(
            ExerciciEntrenoDB.id == exercise_entreno_id,
            ExerciciEntrenoDB.entreno_id == entreno_id
        )
    )
    exercise = result_exercise.scalar_one_or_none()
    if not exercise:
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado en este entreno")

    # Validar si se cambia el nombre del ejercicio, que exista en la tabla ExerciciDB
    if exercise_update.exercici_nom:
        result_exercici_nom = await session.execute(
            select(ExerciciDB).where(ExerciciDB.nom == exercise_update.exercici_nom)
        )
        exercici_db = result_exercici_nom.scalar_one_or_none()
        if not exercici_db:
            raise HTTPException(status_code=400, detail="Nombre de ejercicio no válido")

    # Actualizar campos si vienen en la petición
    if exercise_update.ordre is not None:
        exercise.ordre = exercise_update.ordre
    if exercise_update.exercici_nom is not None:
        exercise.exercici_nom = exercise_update.exercici_nom

    # Commit
    try:
        await session.commit()
        await session.refresh(exercise)
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "message": "Ejercicio actualizado correctamente",
        "exercise": {
            "id": exercise.id,
            "ordre": exercise.ordre,
            "exercici_nom": exercise.exercici_nom
        }
    }
