# the idea is to get all the visible routines for a user
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from sqlalchemy import or_
from app.models import RutinaDB, UsuariDB, GymbroDB, ExerciciRealitzatDB, ExerciciDB
from app.core import get_current_user

get_visible_rutines_router = APIRouter()

@get_visible_rutines_router.get("/visible_for_user")
async def get_visible_rutines(
    session: AsyncSession = Depends(get_async_session),
    user_id: int = Depends(get_current_user)
):
    result = await session.execute(
        select(GymbroDB.usuari2_id).where(GymbroDB.usuari1_id == user_id)
    )
    gymbros_ids = [row[0] for row in result.fetchall()]

    result = await session.execute(
        select(RutinaDB).where(
            or_(
                RutinaDB.admin_id != None,
                RutinaDB.user_id == user_id,
                RutinaDB.user_id.in_(gymbros_ids)
            )
        )
    )
    rutines = result.scalars().all()

    if not rutines:
        return {"message": "No routines found for the user."}
    
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
            rutina_to_first_image[rutina_id] = imatge  # la imagen del primero
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
            "created_by": (
                "You" if r.user_id == user_id else
                "Admin" if r.admin_id else
                "Gymbro"
            ),
            "exercicis": rutina_to_exercicis.get(r.id, []),
            "imatge_primer_exercici": rutina_to_first_image.get(r.id)
        })

    return response