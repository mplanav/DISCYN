from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_session
from app.models import ExerciciDB, GrupMuscularDB, ExerciciGrupMuscularDB, AdministradorDB
from app.core import get_current_user

read_exercici_router = APIRouter()

@read_exercici_router.get("/read-user")
async def get_all_from_user_admin(
    id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    result = await session.execute(select(AdministradorDB).where(AdministradorDB.persona_id == id))
    is_admin = result.scalar_one_or_none()

    if is_admin is not None:
        all_exercices = await session.execute(select(ExerciciDB))
        exercicis = all_exercices.scalars().all()
    else:
        user_exercices = await session.execute(select(ExerciciDB).where(ExerciciDB.usuari_id == id))
        admin_exercices = await session.execute(select(ExerciciDB).where(ExerciciDB.admin_id.is_not(None)))
        exercicis = user_exercices.scalars().all() + admin_exercices.scalars().all()

    response = []
    for exercici in exercicis:
        link_query = await session.execute(
            select(ExerciciGrupMuscularDB.grupmuscular_nom).where(ExerciciGrupMuscularDB.exercici_nom == exercici.nom)
        )
        grups = [row[0] for row in link_query.all()]
        
        response.append({
            "nom": exercici.nom,
            "imatge": exercici.imatge,
            "grups_musculars": grups
        })

    return response
