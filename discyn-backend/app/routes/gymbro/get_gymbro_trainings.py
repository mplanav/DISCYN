from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_
from app.database import get_async_session
from app.models import GymbroDB, EntrenoDB, ExerciciEntrenoDB, UsuariDB, PersonaDB, RutinaDB
from app.core import get_current_user
from app.schemas import EntrenoOut as EntrenoSchema

get_gymbroTraining = APIRouter()

@get_gymbroTraining.get("/entrenos", status_code=status.HTTP_200_OK)
async def get_gymbros_trainings(
    session: AsyncSession = Depends(get_async_session),
    usuari_id: int = Depends(get_current_user)
):
    # Obtener gymbros con status accepted
    result = await session.execute(
        select(GymbroDB).where(
            and_(
                GymbroDB.status == "accepted",
                or_(
                    GymbroDB.usuari1_id == usuari_id,
                    GymbroDB.usuari2_id == usuari_id
                )
            )
        )
    )
    gymbros = result.scalars().all()

    gymbros_ids = []
    for g in gymbros:
        if g.usuari1_id == usuari_id:
            gymbros_ids.append(g.usuari2_id)
        else:
            gymbros_ids.append(g.usuari1_id)

    if not gymbros_ids:
        return []

    # Consulta principal con joins para nombre, foto, rutina
    trainings_result = await session.execute(
        select(
            EntrenoDB,
            PersonaDB.nom,
            PersonaDB.imatge,
            RutinaDB.nom.label('rutina_nom'),
            RutinaDB.id.label('rutina_id'),
        )
        .join(UsuariDB, EntrenoDB.usuari_id == UsuariDB.persona_id)
        .join(PersonaDB, UsuariDB.persona_id == PersonaDB.id)
        .join(RutinaDB, EntrenoDB.rutina_id == RutinaDB.id)
        .where(EntrenoDB.usuari_id.in_(gymbros_ids))
        .order_by(EntrenoDB.datahora.desc())
    )

    rows = trainings_result.all()
    if not rows:
        return {"message": "Your gymbros have not shared any trainings yet."}

    # Buscar el primer ejercicio realizado para cada entreno
    entreno_ids = [row[0].entreno_id for row in rows]
    ejercicios_result = await session.execute(
        select(ExerciciEntrenoDB.entreno_id, ExerciciEntrenoDB.exercici_nom)
        .where(
            and_(
                ExerciciEntrenoDB.entreno_id.in_(entreno_ids),
                ExerciciEntrenoDB.ordre == 1
            )
        )
    )
    ejercicios = ejercicios_result.all()
    primer_ejercicio_map = {r[0]: r[1] for r in ejercicios}

    # Construir lista con todos los datos
    trainings_with_names = []
    for entreno, nom, foto_url, rutina_nom, rutina_id in rows:
        ent_dict = EntrenoSchema.model_validate(entreno).model_dump()
        ent_dict['usuari_nom'] = nom
        ent_dict['usuari_foto'] = foto_url
        ent_dict['rutina_nom'] = rutina_nom
        ent_dict['rutina_id'] = rutina_id
        ent_dict['primer_exercici_realitzat'] = primer_ejercicio_map.get(entreno.entreno_id)
        trainings_with_names.append(ent_dict)

    return trainings_with_names
