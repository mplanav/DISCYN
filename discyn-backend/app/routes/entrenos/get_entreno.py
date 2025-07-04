from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.database import get_async_session
from app.models import EntrenoDB
from app.core import get_current_user

get_entreno_router = APIRouter()

@get_entreno_router.get("/by-user/{entreno_id}")
async def get_entreno(
    entreno_id: int,
    session: AsyncSession = Depends(get_async_session),
    user_id: int = Depends(get_current_user)
):
    # Obtener el entreno con su rutina y ejercicios
    result = await session.execute(
        select(EntrenoDB)
        .options(
            selectinload(EntrenoDB.rutina),
            selectinload(EntrenoDB.exercicis_entreno)
        )
        .where(EntrenoDB.entreno_id == entreno_id)
    )
    entreno = result.scalar_one_or_none()

    if not entreno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entreno no trobat"
        )

    if entreno.usuari_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tens permís per veure aquest entreno"
        )

    # Construir la respuesta con los ejercicios del entreno
    exercicis = [
        {
            "id": ex.id,
            "ordre": ex.ordre,
            "exercici_nom": ex.exercici_nom
        }
        for ex in sorted(entreno.exercicis_entreno, key=lambda e: e.ordre)
    ]

    return {
        "entreno": {
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
        }
    }
