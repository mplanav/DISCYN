from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from app.database import get_async_session
from app.models import GymbroDB
from app.core import get_current_user

delete_gymbro_router = APIRouter()

@delete_gymbro_router.delete("/delete/{usuari2_id}", status_code=status.HTTP_200_OK)
async def delete_gymbro(
    usuari2_id: int,
    session: AsyncSession = Depends(get_async_session),
    usuari1_id: int = Depends(get_current_user)
):
    if usuari1_id == usuari2_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot remove yourself as a gymbro.")
    
    u1, u2 = sorted([usuari1_id, usuari2_id])

    result = await session.execute(
        select(GymbroDB).where(and_(GymbroDB.usuari1_id == u1, GymbroDB.usuari2_id == u2))
    )
    gymbro = result.scalar_one_or_none()

    if not gymbro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gymbro relationship does not exist.")
    
    await session.delete(gymbro)

    try:
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")
    
    return {"message": "Gymbro successfully removed."}

