from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.models import RutinaDB, ExerciciDB, ExerciciRealitzatDB, AdministradorDB, UsuariDB, PersonaDB
from app.core import get_current_user

create_rutina_router = APIRouter()

@create_rutina_router.post("/create")
async def create_rutina(
    nom: str = Form(...),
    exercicis: str = Form(...),
    id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    is_admin = await session.execute(select(AdministradorDB).where(AdministradorDB.persona_id == id))
    is_user = await session.execute(select(UsuariDB).where(UsuariDB.persona_id == id))

    admin = is_admin.scalar_one_or_none()
    user = is_user.scalar_one_or_none()
    if not admin and not user:
        raise HTTPException(status_code=403, detail="User non valid")

    new_rutina = RutinaDB(
        nom=nom,
        admin_id=admin.persona_id if admin else None,
        user_id=user.persona_id if user else None,        
    )
    session.add(new_rutina)
    await session.flush()

    exercicis_noms = [e.strip() for e in exercicis.split(",") if e.strip()]
    ordre = 1

    for exercici_nom in exercicis_noms:
        res = await session.execute(
            select(ExerciciDB).where(ExerciciDB.nom == exercici_nom))
        exercici = res.scalar_one_or_none()
        if not exercici:
            raise HTTPException(status_code=404, detail=f"Exercici '{exercici_nom}' not found")
        
        session.add(ExerciciRealitzatDB(
            ordre=ordre,
            rutina_id=new_rutina.id,
            exercici_nom=exercici.nom
        ))
        ordre += 1

    try:
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "message": f"Rutina '{nom}' creada correctament.",
        "rutina_id": new_rutina.id
    }