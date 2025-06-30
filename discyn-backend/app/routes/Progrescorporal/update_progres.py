from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
from app.database import get_async_session
from app.models import ProgresCorporalDB
from app.core import get_current_user

update_progrescorporal_router = APIRouter()

@update_progrescorporal_router.put("/update/{progreso_id}")
async def update_progreso_corporal(
    progreso_id: int,
    peso: Optional[float] = Body(None),
    cintura: Optional[float] = Body(None),
    pecho: Optional[float] = Body(None),
    brazo: Optional[float] = Body(None),
    imc: Optional[float] = Body(None),
    grasa_corporal: Optional[float] = Body(None),
    masa_muscular: Optional[float] = Body(None),
    session: AsyncSession = Depends(get_async_session),
    user_id: int = Depends(get_current_user)
):
    result = await session.execute(
        select(ProgresCorporalDB).where(
            ProgresCorporalDB.id == progreso_id,
            ProgresCorporalDB.usuari_id == user_id
        )
    )
    progreso = result.scalar_one_or_none()
    if not progreso:
        raise HTTPException(status_code=404, detail="Registro de progreso corporal no encontrado")

    # Actualizar sólo los campos que se reciban
    if peso is not None:
        progreso.peso = peso
    if cintura is not None:
        progreso.cintura = cintura
    if pecho is not None:
        progreso.pecho = pecho
    if brazo is not None:
        progreso.brazo = brazo
    if imc is not None:
        progreso.imc = imc
    if grasa_corporal is not None:
        progreso.grasa_corporal = grasa_corporal
    if masa_muscular is not None:
        progreso.masa_muscular = masa_muscular

    try:
        await session.commit()
        await session.refresh(progreso)
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

    return {
        "message": "Progreso corporal actualizado correctamente",
        "id": progreso.id
    }
