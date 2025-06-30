from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from typing import Optional
from app.database import get_async_session
from app.models import ProgresCorporalDB, UsuariDB
from app.core import get_current_user

create_progrescorporal_router = APIRouter()

@create_progrescorporal_router.post("/create")
async def create_progrescorporal(
    peso: Optional[float] = Form(None),
    cintura: Optional[float] = Form(None),
    pecho: Optional[float] = Form(None),
    brazo: Optional[float] = Form(None),
    imc: Optional[float] = Form(None),
    grasa_corporal: Optional[float] = Form(None),
    masa_muscular: Optional[float] = Form(None),
    fecha: str = Form(...),
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

    # 2. Parsear fecha
    try:
        fecha_parsed = datetime.fromisoformat(fecha)
    except Exception:
        raise HTTPException(status_code=400, detail="Format incorrecte per a fecha")

    # 3. Crear entrada ProgresCorporal
    nuevo_progres = ProgresCorporalDB(
        usuari_id=user.persona_id,
        peso=peso,
        cintura=cintura,
        pecho=pecho,
        brazo=brazo,
        imc=imc,
        grasa_corporal=grasa_corporal,
        masa_muscular=masa_muscular,
        fecha=fecha_parsed
    )

    session.add(nuevo_progres)

    try:
        await session.commit()
        await session.refresh(nuevo_progres)
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error intern: {str(e)}")

    return {
        "message": "Progrés corporal creat correctament",
        "progrescorporal_id": nuevo_progres.id
    }
