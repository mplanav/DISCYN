from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.models import EntrenoDB, ExerciciEntrenoDB
from app.core import get_current_user

delete_exercise_router = APIRouter()

@delete_exercise_router.delete("/entreno/{entreno_id}/exercise/{exercise_entreno_id}")
async def delete_exercise_from_entreno(
    entreno_id: int,
    exercise_entreno_id: int,
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

    # Verificar que el ejercicio existe en ese entreno
    result_ex = await session.execute(
        select(ExerciciEntrenoDB).where(
            ExerciciEntrenoDB.id == exercise_entreno_id,
            ExerciciEntrenoDB.entreno_id == entreno_id
        )
    )
    exercise = result_ex.scalar_one_or_none()

    if not exercise:
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado en este entreno")

    # Borrar
    await session.delete(exercise)
    try:
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Ejercicio eliminado correctamente del entreno"}
