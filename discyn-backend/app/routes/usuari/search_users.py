from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import or_
from app.database import get_async_session
from app.models import UsuariDB, PersonaDB
from app.core import get_current_user

search_users_router = APIRouter()

@search_users_router.get("/search")
async def search_all_users(
    q: str = "",  # parámetro query opcional para filtrar por nombre
    session: AsyncSession = Depends(get_async_session),
    current_user_id: int = Depends(get_current_user)
):
    # Buscar usuarios cuyo nombre contenga la query (case insensitive)
    stmt = select(UsuariDB).options(selectinload(UsuariDB.persona))
    if q:
        stmt = stmt.join(PersonaDB).where(PersonaDB.nom.ilike(f"%{q}%"))
    
    result = await session.execute(stmt)
    users = result.scalars().unique().all()

    # Mapeamos para devolver solo la info que queremos (id y nombre)
    response = [
        {
            "persona_id": user.persona_id,
            "nom": user.persona.nom,
            "imatge": user.persona.imatge
        }
        for user in users
        if user.persona_id != current_user_id 
    ]

    return response
