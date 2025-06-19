from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.schemas import Persona, PersonaUsuariAdmin
from app.models import PersonaDB, UsuariDB, AdministradorDB
from app.core import security, settings
from datetime import date
import os



register_router = APIRouter()

persona_path = os.path.join(settings.UPLOAD_DIR, "persona")

@register_router.post("/register", response_model=Persona)
async def register(persona: PersonaUsuariAdmin, session: AsyncSession = Depends(get_async_session)):
    
    result = await session.execute(
        select(PersonaDB).where(PersonaDB.correuelectronic == persona.correuelectronic)
    )
    existing_persona = result.scalar_one_or_none()

    if existing_persona:
        raise HTTPException(status_code=400, detail="This email is already registered")
    
    if persona.genere is not None and persona.genere not in ["Man", "Woman", "Other"]:
        raise HTTPException(status_code=400, detail="Invalid Gender specified. 'Man' 'Woman' or 'Other'")
    if persona.datanaixement is not None and (persona.datanaixement > date.today() or persona.datanaixement < date(1900, 1, 1) or persona.datanaixement.year > date.today().year - 16):
        raise HTTPException(status_code=400, detail="Invalid date of birth you should be at least 16 years old")
    
    os.makedirs(persona_path, exist_ok=True)

    hash_contrasenya = security.hash_password(persona.contrasenya)
    default_person_image_url = "/static/images/persona/default-profile-image.jpeg"

    persona_db = PersonaDB(
        nom=persona.nom,
        correuelectronic=persona.correuelectronic,
        contrasenya=hash_contrasenya,
        datanaixement=persona.datanaixement,
        genere=persona.genere,
        imatge=default_person_image_url
    )
    session.add(persona_db)
    await session.flush() 

    if persona.rol == "usuari":
        valid_height = persona.altura is None or persona.altura > 59
        valid_weight = persona.pes is None or persona.pes > 30
        no_licence = persona.llicencia is None

        if no_licence and (
            (persona.altura is None and persona.pes is None) or
            (persona.altura is not None and persona.pes is not None and valid_height and valid_weight)
        ):
            user_db = UsuariDB(
                persona_id=persona_db.id,
                altura=persona.altura,
                pes=persona.pes
            )
            session.add(user_db)
        else:
            raise HTTPException(
                status_code=400,
                detail="The user must have valid height and weight (>59cm and >30kg) or both as None, and must not have a license."
            )


    elif persona.rol == "administrador":
        if persona.pes is None and persona.altura is None and persona.llicencia is not None:
            admin_db = AdministradorDB(
                persona_id=persona_db.id,
                llicencia=persona.llicencia
            )
            session.add(admin_db)
        else:
            raise HTTPException(status_code=400, detail="The administrator must have a valid license")

    else:
        raise HTTPException(status_code=400, detail="Invalid role specified. Must be 'usuari' or 'administrador'")
    

    try:
        await session.commit()
        await session.refresh(persona_db)   
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail="Error intern")

    return persona_db