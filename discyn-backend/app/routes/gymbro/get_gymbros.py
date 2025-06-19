from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_
from app.database import get_async_session
from app.models import UsuariDB, GymbroDB, PersonaDB
from app.schemas import AddGymbro
from app.core import get_current_user

get_gymbros_router = APIRouter()

from app.models import UsuariDB, GymbroDB, PersonaDB  # Asegúrate de importar PersonaDB también
from sqlalchemy import select, or_

@get_gymbros_router.get("/list")
async def get_gymbros(
    session: AsyncSession = Depends(get_async_session),
    usuari_id: int = Depends(get_current_user)
):
    # Buscar pares donde el usuario es usuari1 o usuari2
    result = await session.execute(
        select(GymbroDB).where(
            or_(
                GymbroDB.usuari1_id == usuari_id,
                GymbroDB.usuari2_id == usuari_id
            )
        )
    )
    pairs = result.scalars().all()

    # Extraer los IDs de los gymbros
    gymbro_ids = []
    for pair in pairs:
        if pair.usuari1_id == usuari_id:
            gymbro_ids.append(pair.usuari2_id)
        else:
            gymbro_ids.append(pair.usuari1_id)

    if not gymbro_ids:
        return []

    # Hacer join con PersonaDB para traer el nombre
    query = (
        select(UsuariDB.persona_id, PersonaDB.nom)
        .join(PersonaDB, UsuariDB.persona_id == PersonaDB.id)
        .where(UsuariDB.persona_id.in_(gymbro_ids))
    )
    result2 = await session.execute(query)
    gymbros = result2.all()  # devuelve lista de tuplas (persona_id, nom)

    # Convertimos a lista de dicts
    return [{"persona_id": pid, "nom": nom} for pid, nom in gymbros]

