from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.database import get_async_session
from app.models import EntrenoDB, ExerciciEntrenoDB
from app.core import get_current_user

list_exercises_router = APIRouter()

@list_exercises_router.get("/{entreno_id}/listexercices")
async def list_exercises_entreno(
    entreno_id: int,
    session: AsyncSession = Depends(get_async_session),
    user_id: int = Depends(get_current_user)
):
    # Verificar que el entreno existe y pertenece al usuario
    result_entreno = await session.execute(
        select(EntrenoDB).where(EntrenoDB.entreno_id == entreno_id)
    )
    entreno = result_entreno.scalar_one_or_none()
    if not entreno:
        raise HTTPException(status_code=404, detail="Entreno no encontrado")
    if entreno.usuari_id != user_id:
        raise HTTPException(status_code=403, detail="No autorizado para ver este entreno")

    # Obtener los ejercicios del entreno ordenados por ordre
    result_exercises = await session.execute(
        select(ExerciciEntrenoDB)
        .where(ExerciciEntrenoDB.entreno_id == entreno_id)
        .order_by(ExerciciEntrenoDB.ordre)
    )
    exercises = result_exercises.scalars().all()

    return {
        "entreno_id": entreno_id,
        "exercises": [
            {
                "id": e.id,
                "ordre": e.ordre,
                "exercici_nom": e.exercici_nom
            }
            for e in exercises
        ]
    }
