from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.models import RutinaDB
from app.core import get_current_user

delete_rutina_router = APIRouter()

@delete_rutina_router.delete("/delete/{id}")
async def delete_rutina(
    id: int,
    current_user: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Buscar la rutina
    result = await session.execute(
        select(RutinaDB).where(RutinaDB.id == id)
    )
    rutina = result.scalar_one_or_none()

    if rutina is None:
        raise HTTPException(status_code=404, detail="Routine not found")

    # Verificar si el usuario actual es el creador
    if rutina.user_id != current_user and rutina.admin_id != current_user:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own routines."
        )

    # Borrar la rutina
    await session.delete(rutina)
    
    try:
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

    return {"message": f"Rutina with ID {id} has been deleted successfully."}
