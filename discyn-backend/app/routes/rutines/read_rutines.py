from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.models import RutinaDB, AdministradorDB, UsuariDB, ExerciciRealitzatDB, ExerciciDB
from app.core import get_current_user

read_rutines_router = APIRouter()

@read_rutines_router.get("/user-all")
async def get_own_rutines(
    session: AsyncSession = Depends(get_async_session),
    persona_id: int = Depends(get_current_user)
):
    result = await session.execute(select(AdministradorDB).where(AdministradorDB.persona_id == persona_id))
    is_admin = result.scalar_one_or_none() is not None

    result = await session.execute(
        select(RutinaDB).where(
            RutinaDB.admin_id == persona_id if is_admin else RutinaDB.user_id == persona_id
        )
    )
    rutines = result.scalars().all()

    rutina_ids = [r.id for r in rutines]

    result = await session.execute(
        select(
            ExerciciRealitzatDB.rutina_id,
            ExerciciRealitzatDB.ordre,
            ExerciciRealitzatDB.exercici_nom,
            ExerciciDB.imatge
        )
        .join(ExerciciDB, ExerciciRealitzatDB.exercici_nom == ExerciciDB.nom)
        .where(ExerciciRealitzatDB.rutina_id.in_(rutina_ids))
        .order_by(ExerciciRealitzatDB.rutina_id, ExerciciRealitzatDB.ordre)
    )
    exercicis_data = result.fetchall()

    rutina_to_exercicis = {}
    rutina_to_first_image = {}

    for rutina_id, ordre, nom, imatge in exercicis_data:
        if rutina_id not in rutina_to_exercicis:
            rutina_to_exercicis[rutina_id] = []
            rutina_to_first_image[rutina_id] = imatge
        rutina_to_exercicis[rutina_id].append({
            "ordre": ordre,
            "nom": nom,
            "imatge": imatge
        })

    response = []
    for r in rutines:
        response.append({
            "id": r.id,
            "nom": r.nom,
            "created_by": "You",  
            "exercicis": rutina_to_exercicis.get(r.id, []),
            "imatge_primer_exercici": rutina_to_first_image.get(r.id)
        })

    return response
