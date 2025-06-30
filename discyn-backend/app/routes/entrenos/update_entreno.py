from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, time
from app.database import get_async_session
from app.models import EntrenoDB
from app.core import get_current_user

update_entreno_router = APIRouter()

@update_entreno_router.put("/update/{entreno_id}")
async def update_entreno(
    entreno_id: int,
    pestotal: float = Form(...),
    duraciototal: str = Form(...),
    sensacions: str = Form(...),
    datahora: str = Form(...),
    recorregut: float = Form(None),
    session: AsyncSession = Depends(get_async_session),
    user_id: int = Depends(get_current_user)
):
    # Buscar entreno
    result = await session.execute(
        select(EntrenoDB).where(EntrenoDB.entreno_id == entreno_id)
    )
    entreno = result.scalar_one_or_none()
    if not entreno:
        raise HTTPException(status_code=404, detail="Entreno no encontrado")

    if entreno.usuari_id != user_id:
        raise HTTPException(status_code=403, detail="No autorizado para modificar este entreno")

    # Parsear fechas y horas
    try:
        duracio_parsed = time.fromisoformat(duraciototal)
        datahora_parsed = datetime.fromisoformat(datahora)
    except Exception:
        raise HTTPException(status_code=400, detail="Formato incorrecto para fecha u hora")

    # Actualizar campos
    entreno.pestotal = pestotal
    entreno.duraciototal = duracio_parsed
    entreno.sensacions = sensacions
    entreno.datahora = datahora_parsed
    entreno.recorregut = recorregut

    try:
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Entreno actualizado correctamente"}
