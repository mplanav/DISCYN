from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.models import GrupMuscularDB, AdministradorDB
from app.core import get_current_user, settings
import uuid
import os

read_grupmuscular_router = APIRouter()



@read_grupmuscular_router.get("/read-all")
async def get_all_grupmuscular(session: AsyncSession = Depends(get_async_session)):
    res_grups = await session.execute(select(GrupMuscularDB))
    grups_musculars = res_grups.scalars().all()  
    return grups_musculars
