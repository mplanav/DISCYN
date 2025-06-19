from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_
from app.database import get_async_session
from app.core import get_current_user
from app.models import PersonaDB, AdministradorDB, EntrenoDB, RutinaDB,GymbroDB 
from app.schemas import PersonaRead


read_persona_router = APIRouter()

@read_persona_router.get("/all", response_model=list[PersonaRead])
async def read_all_personas(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(PersonaDB))
    personas = result.scalars().all()

    if not personas:
        raise HTTPException(status_code=404, detail="No personas found")

    return [PersonaRead(
        id=persona.id,
        nom=persona.nom,
        correuelectronic=persona.correuelectronic,
        datanaixement=persona.datanaixement,
        genere=persona.genere,
        imatge=persona.imatge
    ) for persona in personas]

@read_persona_router.get("/{id}", response_model=PersonaRead)
async def read_persona(id: int, session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(
        select(PersonaDB).where(PersonaDB.id == id)
    )
    persona = result.scalar_one_or_none()

    if not persona:
        raise HTTPException(status_code=404, detail="This Persona is not found")

    return PersonaRead(
        id=persona.id,
        nom=persona.nom,
        correuelectronic=persona.correuelectronic,
        datanaixement=persona.datanaixement,
        genere=persona.genere,
        imatge=persona.imatge
    )

@read_persona_router.get("/profile-admin-stats/{id}")
async def get_admin_stats(
    id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    query = select(func.count()).select_from(RutinaDB).where(RutinaDB.admin_id == id)

    res_count = await session.execute(query)
    count = res_count.scalar_one()

    return {"count": count}

@read_persona_router.get("/profile-user-stats/{id}")
async def get_user_stats(
    id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    query = select(func.count()).select_from(EntrenoDB).where(EntrenoDB.usuari_id == id)

    res_count = await session.execute(query)
    count = res_count.scalar_one()

    gymbros_q = select(func.count()).select_from(GymbroDB).where(
        or_(
            GymbroDB.usuari1_id == id,
            GymbroDB.usuari2_id == id
        )
    )
    
    gymbros_count = await session.execute(gymbros_q)

    gym = gymbros_count.scalar_one()
    return {"count": count, "gymbros": gym}
