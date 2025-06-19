from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, time
from app.database import get_async_session
from app.models import EntrenoDB, RutinaDB, UsuariDB
from app.core import get_current_user

create_entreno_router = APIRouter()

@create_entreno_router.post("/create")
async def create_entreno(
    rutina_id: int = Form(...),
    pestotal: float = Form(...),
    duraciototal: str = Form(...),
    sensacions: str = Form(...),
    datahora: str = Form(...),
    session: AsyncSession = Depends(get_async_session),
    id: int = Depends(get_current_user)
):
    result_user = await session.execute(select(UsuariDB).where(UsuariDB.persona_id == id))
    user = result_user.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=403, detail="User not valid")
    
    result_rutina = await session.execute(select(RutinaDB).where(RutinaDB.id == rutina_id))
    rutina = result_rutina.scalar_one_or_none()
    if not rutina:
        raise HTTPException(status_code=404, detail="routine not found")
    
    try:
        duracio_parsed = time.fromisoformat(duraciototal)
        datahora_parsed = datetime.fromisoformat(datahora)
    except Exception:
        raise HTTPException(status_code=400, detail="data or time format incorrect")
    
    nou_entreno = EntrenoDB(
        usuari_id=user.persona_id,
        rutina_id=rutina.id,
        pestotal=pestotal,
        duraciototal=duracio_parsed,
        sensacions=sensacions,
        datahora=datahora_parsed
    )

    session.add(nou_entreno)

    try:
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "Entreno creat correctament"}