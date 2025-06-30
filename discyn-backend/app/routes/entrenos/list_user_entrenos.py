from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.database import get_async_session
from app.models import EntrenoDB
from app.core import get_current_user

list_entrenos_router = APIRouter()

@list_entrenos_router.get("/all-user")
async def list_entrenos(
    session: AsyncSession = Depends(get_async_session),
    user_id: int = Depends(get_current_user)
):
    # Obtener todos los entrenos del usuario con sus rutinas y ejercicios
    result = await session.execute(
        select(EntrenoDB)
        .options(
            selectinload(EntrenoDB.rutina),
            selectinload(EntrenoDB.exercicis_entreno)
        )
        .where(EntrenoDB.usuari_id == user_id)
        .order_by(EntrenoDB.datahora.desc())
    )
    entrenos = result.scalars().all()

    # Formatear la respuesta
    entrenos_list = []
    for entreno in entrenos:
        exercicis = [
            {
                "id": ex.id,
                "ordre": ex.ordre,
                "exercici_nom": ex.exercici_nom
            }
            for ex in sorted(entreno.exercicis_entreno, key=lambda e: e.ordre)
        ]

        entrenos_list.append({
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
        })

    return {"entrenos": entrenos_list}
