from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, time
from typing import Optional
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
    recorregut: Optional[float] = Form(None),
    session: AsyncSession = Depends(get_async_session),
    user_id: int = Depends(get_current_user)
):
    # 1. Verificar usuario
    result_user = await session.execute(
        select(UsuariDB).where(UsuariDB.persona_id == user_id)
    )
    user = result_user.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=403, detail="Usuari no vàlid")

    # 2. Verificar rutina y propiedad
    result_rutina = await session.execute(
        select(RutinaDB).where(RutinaDB.id == rutina_id)
    )
    rutina = result_rutina.scalar_one_or_none()
    if not rutina:
        raise HTTPException(status_code=404, detail="Rutina no trobada")
    if rutina.user_id != user_id:
        raise HTTPException(status_code=403, detail="No tens permís per aquesta rutina")

    # 3. Parsear tiempos
    try:
        duracio_parsed = time.fromisoformat(duraciototal)
        datahora_parsed = datetime.fromisoformat(datahora)
    except Exception:
        raise HTTPException(status_code=400, detail="Format incorrecte per a data o duració")

    # 4. Crear Entreno
    nou_entreno = EntrenoDB(
        usuari_id=user.persona_id,
        rutina_id=rutina.id,
        pestotal=pestotal,
        duraciototal=duracio_parsed,
        sensacions=sensacions,
        datahora=datahora_parsed,
        recorregut=recorregut
    )

    session.add(nou_entreno)

    try:
        await session.commit()
        await session.refresh(nou_entreno)
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error intern: {str(e)}")

    return {
        "message": "Entreno creat correctament",
        "entreno_id": nou_entreno.entreno_id
    }
