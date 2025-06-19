from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.models import PersonaDB
from app.schemas import *
from app.core import get_current_user, security
from datetime import date
from app.core import settings
import os
import uuid

update_persona_router = APIRouter()

persona_path = os.path.join(settings.UPLOAD_DIR, "persona")

@update_persona_router.put("/name")
async def update_name(persona_name: PersonaUpdateName, id: int = Depends(get_current_user), session: AsyncSession = Depends(get_async_session)):
    stmt = select(PersonaDB).where(PersonaDB.id == id)
    result = await session.execute(stmt)
    persona = result.scalar_one_or_none()

    if persona is None:
        raise HTTPException(status_code=404, detail="Persona no encontrada")

    persona.nom = persona_name.nom
    await session.commit()
    return {"message": f"Name updated to {persona.nom}"}


@update_persona_router.put("/password")
async def update_name(persona_password: PersonaUpdatePassword, id: int = Depends(get_current_user), session: AsyncSession = Depends(get_async_session)):
    stmt = select(PersonaDB).where(PersonaDB.id == id)
    result = await session.execute(stmt)
    persona = result.scalar_one_or_none()

    if persona is None:
        raise HTTPException(status_code=404, detail="Persona no encontrada")

    if not security.verify_password(persona_password.password, persona.contrasenya):
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    if persona_password.new_password == persona_password.password:
        raise HTTPException(status_code=400, detail="New password cannot be the same as the old password")
    
    persona.contrasenya = security.hash_password(persona_password.new_password)

    await session.commit()
    return {"message": "Password updated successfully"}


@update_persona_router.put("/gender")
async def update_name(persona_gender: PersonaUpdateGender, id: int = Depends(get_current_user), session: AsyncSession = Depends(get_async_session)):
    stmt = select(PersonaDB).where(PersonaDB.id == id)
    result = await session.execute(stmt)
    persona = result.scalar_one_or_none()

    if persona is None:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    if persona_gender.gender not in ["Man", "Woman", "Other"]:
        raise HTTPException(status_code=400, detail="Invalid Gender specified. 'Man' 'Woman' or 'Other'")
    
    persona.genere = persona_gender.gender
    await session.commit()
    return {"message": "Gander updated successfully"}


@update_persona_router.put("/date_of_birth")
async def update_name(persona_date: PersonaUpdateDate, id: int = Depends(get_current_user), session: AsyncSession = Depends(get_async_session)):
    stmt = select(PersonaDB).where(PersonaDB.id == id)
    result = await session.execute(stmt)
    persona = result.scalar_one_or_none()

    if persona is None:
        raise HTTPException(status_code=404, detail="Persona not found")

    if persona_date.date > date.today() or persona_date.date < date(1900, 1, 1) or persona_date.date.year > date.today().year - 16:
        raise HTTPException(status_code=400, detail="Invalid date of birth")
    
    persona.datanaixement = persona_date.date

    await session.commit()
    return {"message": "Date of birth updated successfully"}


@update_persona_router.put("/image")
async def update_name(image: UploadFile = File(...), id: int = Depends(get_current_user), session: AsyncSession = Depends(get_async_session)):
    
    if image.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Image format not supported")

    stmt = select(PersonaDB).where(PersonaDB.id == id)
    result = await session.execute(stmt)
    persona = result.scalar_one_or_none()

    if persona is None:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    
    os.makedirs(persona_path, exist_ok=True)
    ext = image.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(persona_path, unique_filename)

    relative_path = f"/static/images/persona/{unique_filename}"

    with open(file_path, "wb") as f:
        f.write(await image.read())
    
    persona.imatge = relative_path
    await session.commit()
    return {
        "message": "Profile pic updated successfully",
        "imatge_url": relative_path
    }
