from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from app.database import get_async_session
from app.models import RutinaDB, ExerciciDB, ExerciciRealitzatDB
from app.core import get_current_user
from app.schemas import RutinaUpdate

update_rutina_router = APIRouter()

@update_rutina_router.put("/update/{id}")
async def update_rutina(
    id: int,
    rutina_data: RutinaUpdate,
    current_user: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    # Buscar la rutina
    result = await session.execute(
        select(RutinaDB).where(RutinaDB.id == id)
    )
    rutina = result.scalar_one_or_none()

    if rutina is None:
        raise HTTPException(status_code=404, detail="Rutina not found")

    # Validar permisos
    if rutina.user_id != current_user and rutina.admin_id != current_user:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own routines."
        )

    # Actualizar nombre si se pasa
    if rutina_data.nom is not None:
        rutina.nom = rutina_data.nom

    # Actualizar tipo si se pasa
    if rutina_data.tipo is not None:
        rutina.tipo = rutina_data.tipo

    # Actualizar ejercicios si se pasan
    if rutina_data.exercicis is not None:
        # Parsear lista de nombres
        exercicis_noms = [e.strip() for e in rutina_data.exercicis.split(",") if e.strip()]

        # Validar que todos existen antes de borrar nada
        valid_exercicis = []
        for exercici_nom in exercicis_noms:
            res = await session.execute(
                select(ExerciciDB).where(ExerciciDB.nom == exercici_nom)
            )
            exercici = res.scalar_one_or_none()
            if not exercici:
                raise HTTPException(
                    status_code=404,
                    detail=f"Exercici '{exercici_nom}' not found"
                )
            valid_exercicis.append(exercici.nom)

        # Ahora es seguro borrar los anteriores
        await session.execute(
            delete(ExerciciRealitzatDB).where(ExerciciRealitzatDB.rutina_id == id)
        )

        # Insertar los nuevos ejercicios con orden
        ordre = 1
        for exercici_nom in valid_exercicis:
            session.add(
                ExerciciRealitzatDB(
                    ordre=ordre,
                    rutina_id=id,
                    exercici_nom=exercici_nom
                )
            )
            ordre += 1

    # Commit
    try:
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")

    return {"message": f"Rutina with ID {id} has been updated successfully."}

