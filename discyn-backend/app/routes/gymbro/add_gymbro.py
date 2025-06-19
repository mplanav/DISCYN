from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from app.database import get_async_session
from app.models import UsuariDB, GymbroDB
from app.schemas import AddGymbro
from app.core import get_current_user

add_gymbro_router = APIRouter()

@add_gymbro_router.post("/add", status_code=status.HTTP_201_CREATED)
async def add_gymbro(
    data: AddGymbro,
    session: AsyncSession = Depends(get_async_session),
    usuari1_id: int = Depends(get_current_user)
):
    usuari2_id = data.usuari2_id
    if usuari1_id == usuari2_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot add yourself as a gymbro.")
    
    result1 = await session.execute(select(UsuariDB).where(UsuariDB.persona_id == usuari1_id))
    usuari1 = result1.scalar_one_or_none()
    if not usuari1:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="The user with the provided ID does not exist.")

    result2 = await session.execute(select(UsuariDB).where(UsuariDB.persona_id == usuari2_id))
    usuari2 = result2.scalar_one_or_none()
    if not usuari2:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID {usuari2_id} does not exist.")
    
    u1, u2 = sorted([usuari1_id, usuari2_id])

    exist_gymbro = await session.execute(
        select(GymbroDB).where(and_(GymbroDB.usuari1_id == u1, GymbroDB.usuari2_id == u2))
    )
    if exist_gymbro.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You and this user are already gymbros.")
    
    new_gymbro = GymbroDB(usuari1_id=u1, usuari2_id=u2)
    session.add(new_gymbro)

    try:
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error intern: {str(e)}")

    return {"message": "Congrats, you have a new gymbro!"}