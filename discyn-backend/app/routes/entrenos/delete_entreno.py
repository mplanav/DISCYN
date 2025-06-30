from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.models import EntrenoDB
from app.core import get_current_user

delete_entreno_router = APIRouter()

@delete_entreno_router.delete("/delete/{entreno_id}")
async def delete_entreno(
    entreno_id: int,
    session: AsyncSession = Depends(get_async_session),
    user_id: int = Depends(get_current_user)
):
    # Buscar entreno
    result = await session.execute(
        select(EntrenoDB).where(EntrenoDB.entreno_id == entreno_id)
    )
    entreno = result.scalar_one_or_none()

    if not entreno:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entreno no encontrado")

    if entreno.usuari_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado para borrar este entreno")

    await session.delete(entreno)
    try:
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Entreno eliminado correctamente"}
