from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, asc
from app.database import get_async_session
from app.models import (
    RutinaDB,
    ExerciciRealitzatDB,
    ExerciciDB,
    PersonaDB,
    UsuariDB,
    AdministradorDB
)

frequent_rutines_router = APIRouter()

@frequent_rutines_router.get("/frequent")
async def get_frequent_rutines(session: AsyncSession = Depends(get_async_session)):
    # 1. Obtener las rutinas más frecuentes
    result = await session.execute(
        select(
            RutinaDB.id,
            RutinaDB.nom,
            RutinaDB.admin_id,
            RutinaDB.user_id,
            func.count(ExerciciRealitzatDB.id).label("freq")
        )
        .join(ExerciciRealitzatDB, RutinaDB.id == ExerciciRealitzatDB.rutina_id)
        .group_by(RutinaDB.id)
        .order_by(func.count(ExerciciRealitzatDB.id).desc())
        .limit(10)
    )

    rutinas_raw = result.all()
    rutinas_final = []

    for rutina in rutinas_raw:
        rutina_id = rutina.id

        # 2. Obtener ejercicios de la rutina ordenados por 'ordre'
        ejercicios_result = await session.execute(
            select(
                ExerciciDB.nom,
                ExerciciDB.imatge
            )
            .join(ExerciciRealitzatDB, ExerciciDB.nom == ExerciciRealitzatDB.exercici_nom)
            .where(ExerciciRealitzatDB.rutina_id == rutina_id)
            .order_by(ExerciciRealitzatDB.ordre)
        )
        ejercicios = [{"nom": e.nom, "imatge": e.imatge} for e in ejercicios_result.all()]
        imatge_primer_exercici = ejercicios[0]["imatge"] if ejercicios else None

        # 3. Obtener nombre del creador (usuario o admin)
        creador_nom = None
        if rutina.user_id:
            creador_result = await session.execute(
                select(PersonaDB.nom)
                .join(UsuariDB, UsuariDB.persona_id == PersonaDB.id)
                .where(UsuariDB.persona_id == rutina.user_id)
            )
            creador_nom = creador_result.scalar()
        elif rutina.admin_id:
            creador_result = await session.execute(
                select(PersonaDB.nom)
                .join(AdministradorDB, AdministradorDB.persona_id == PersonaDB.id)
                .where(AdministradorDB.persona_id == rutina.admin_id)
            )
            creador_nom = creador_result.scalar()

        # 4. Armar respuesta final
        rutinas_final.append({
            "id": rutina.id,
            "nom": rutina.nom,
            "freq": rutina.freq,
            "created_by": creador_nom,
            "imatge_primer_exercici": imatge_primer_exercici,
            "exercicis": ejercicios
        })

    return rutinas_final
