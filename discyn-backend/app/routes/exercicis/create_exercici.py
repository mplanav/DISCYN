"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.models import ExerciciDB, GrupMuscularDB, AdministradorDB, ExerciciGrupMuscularDB, UsuariDB
from app.core import get_current_user, settings
import uuid
import os

create_exercici_router = APIRouter()
exercici_path = os.path.join(settings.UPLOAD_DIR, "exercicis")

@create_exercici_router.post("/create")
async def create_exercici(
    nom: str = Form(...),
    grups_musculars: str = Form(...),
    imatge: UploadFile = File(...),
    id : int = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    is_admin = await session.execute(select(AdministradorDB).where(AdministradorDB.persona_id == id))
    is_user = await session.execute(select(UsuariDB).where(UsuariDB.persona_id == id))

    admin = is_admin.scalar_one_or_none()
    user = is_user.scalar_one_or_none()
    if not admin and not user:
        raise HTTPException(status_code=403, detail="User no valid")
    
    if imatge.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Format d’imatge no suportat") 
    
    os.makedirs(exercici_path, exist_ok=True)
    ext = imatge.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(exercici_path, unique_filename)
    with open(file_path, "wb") as f:
        f.write(await imatge.read())
    relative_path = f"/static/images/exercici/{unique_filename}"

    new_exercici = ExerciciDB(
        nom=nom, 
        imatge=relative_path,
        admin_id=admin.persona_id if admin else None,
        usuari_id=user.persona_id if user else None,
    )
    session.add(new_exercici)
    await session.flush()

    grups_names = [g.strip() for g in grups_musculars.split(",") if g.strip()]
    for group_name in grups_names:
        group = await session.execute(
            select(GrupMuscularDB).where(GrupMuscularDB.nom == group_name)
        )
        group_res = group.scalar_one_or_none()
        if not group_res:
            raise HTTPException(status_code=404, detail=f"Grup muscular '{group_name}' not found")
        
        session.add(ExerciciGrupMuscularDB(
            exercici_nom=new_exercici.nom,
            grupmuscular_nom=group_res.nom
        ))

    try:
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "message": f"Exercici '{nom}' creat correctament.",
        "imatge_url": relative_path
    }
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.models import (
    ExerciciDB,
    GrupMuscularDB,
    AdministradorDB,
    ExerciciGrupMuscularDB,
    UsuariDB,
)
from app.core import get_current_user, settings
import uuid
import os
import logging
logger = logging.getLogger(__name__)

create_exercici_router = APIRouter()
exercici_path = os.path.join(settings.UPLOAD_DIR, "exercicis")

@create_exercici_router.post("/create")
async def create_exercici(
    nom: str = Form(...),
    grups_musculars: List[str] = Form(...),  
    imatge: UploadFile = File(...),
    id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    grups_musculars_llista = [g.strip() for g in grups_musculars[0].split(",")]
    
    is_admin = await session.execute(select(AdministradorDB).where(AdministradorDB.persona_id == id))
    is_user = await session.execute(select(UsuariDB).where(UsuariDB.persona_id == id))
    admin = is_admin.scalar_one_or_none()
    user = is_user.scalar_one_or_none()

    if not admin and not user:
        raise HTTPException(status_code=403, detail="Usuari no vàlid")

    if imatge.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Format d’imatge no suportat") 

    os.makedirs(exercici_path, exist_ok=True)
    ext = imatge.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(exercici_path, unique_filename)
    with open(file_path, "wb") as f:
        f.write(await imatge.read())

    relative_path = f"/static/images/exercicis/{unique_filename}"

    new_exercici = ExerciciDB(
        nom=nom,
        imatge=relative_path,  
        admin_id=admin.persona_id if admin else None,
        usuari_id=user.persona_id if user else None,
    )
    session.add(new_exercici)

    for group_name in grups_musculars_llista:

        result = await session.execute(
            select(GrupMuscularDB).where(GrupMuscularDB.nom == group_name)
        )
        group = result.scalar_one_or_none()
        if not group:
            raise HTTPException(status_code=404, detail=f"Grup muscular '{group_name}' no trobat")


        link = ExerciciGrupMuscularDB(
            exercici_nom=nom,
            grupmuscular_nom=group.nom
        )
        session.add(link)

    try:
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "message": f"Exercici '{nom}' creat correctament.",
        "imatge_url": relative_path
    }
