from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.database import get_async_session
from app.models import EntrenoDB, ExerciciRealitzatDB
from app.core import get_current_user

get_entreno_router = APIRouter()

@get_entreno_router.get("/{entreno_id}")
async def get_entreno(
    entreno_id: int,
    session: AsyncSession = Depends(get_async_session),
    user_id: int = Depends(get_current_user)
):
    # Obtener el entreno con la rutina
    result = await session.execute(
        select(EntrenoDB)
        .options(selectinload(EntrenoDB.rutina))
        .where(EntrenoDB.entreno_id == entreno_id)
    )
    entreno = result.scalar_one_or_none()

    if not entreno:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entreno no encontrado")

    if entreno.usuari_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado para ver este entreno")

    rutina_id = entreno.rutina_id

    # Buscar ejercicios realizados asociados a la rutina
    result = await session.execute(
        select(ExerciciRealitzatDB)
        .where(ExerciciRealitzatDB.rutina_id == rutina_id)
    )
    ejercicios_realizados = result.scalars().all()

    # Determinar tipo de entreno
    tipo_entreno = "classica"  # default

    for ejercicio in ejercicios_realizados:
        await session.refresh(ejercicio, attribute_names=["hipertrofia", "rendiment"])
        if ejercicio.rendiment is not None:
            tipo_entreno = "rendiment"
            break
        elif ejercicio.hipertrofia is not None:
            tipo_entreno = "classica"

    return {
        "training": {
            "entreno_id": entreno.entreno_id,
            "tipo": tipo_entreno,
            "pestotal": entreno.pestotal,
            "duraciototal": entreno.duraciototal.isoformat() if entreno.duraciototal else None,
            "sensacions": entreno.sensacions,
            "datahora": entreno.datahora.isoformat() if entreno.datahora else None,
            "rutina_id": entreno.rutina_id,
        }
    }
