from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from app.database import get_async_session
from app.models import GymbroDB
from app.core import get_current_user

accept_gymbro_router = APIRouter()

@accept_gymbro_router.post("/accept/{other_user_id}", status_code=status.HTTP_200_OK)
async def accept_gymbro(
    other_user_id: int,
    session: AsyncSession = Depends(get_async_session),
    current_user_id: int = Depends(get_current_user)
):
    u1, u2 = sorted([current_user_id, other_user_id])

    # Buscar la relación pendiente
    result = await session.execute(
        select(GymbroDB).where(
            and_(
                GymbroDB.usuari1_id == u1,
                GymbroDB.usuari2_id == u2,
                GymbroDB.status == "pending"
            )
        )
    )
    gymbro_request = result.scalar_one_or_none()

    if not gymbro_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pending friend request found between these users."
        )

    # Actualizar estado a accepted
    gymbro_request.status = "accepted"

    try:
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

    return {"message": "Friend request accepted successfully."}
