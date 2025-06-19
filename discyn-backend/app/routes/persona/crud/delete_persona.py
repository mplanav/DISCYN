from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.models import PersonaDB, AdministradorDB
from app.schemas import Persona
from app.core import get_current_user


delete_persona_router = APIRouter()

@delete_persona_router.delete("/delete/{id}")
async def delete_persona(id: int, current_user: int = Depends(get_current_user), session: AsyncSession = Depends(get_async_session) ):
    result = await session.execute(
        select(PersonaDB).where(PersonaDB.id == id)
    )
    delete_persona = result.scalar_one_or_none()

    if delete_persona is None:
        raise HTTPException(status_code=404, detail="Persona not found")

    
    result = await session.execute(
        select(AdministradorDB).where(AdministradorDB.persona_id == current_user)
    )
    admin = result.scalar_one_or_none()

    if id != current_user and admin is None:
        raise HTTPException(status_code=403, detail="You need to be an administrator or the owner of the persona to delete it.")


    await session.delete(delete_persona)
    
    try:
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Error intern: {str(e)}")

    return {"message": f"Persona with ID {id} has been deleted successfully."}
    