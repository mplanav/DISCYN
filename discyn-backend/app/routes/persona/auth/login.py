from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.models import PersonaDB, UsuariDB, AdministradorDB
from app.schemas import LoginRequest, LoginResponse
from app.core import create_access_token, verify_token
from fastapi.responses import JSONResponse
from app.core import security
from app.core import create_access_token, verify_token


login_router = APIRouter()

@login_router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest, session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(
        select(PersonaDB).where(PersonaDB.correuelectronic == data.correuelectronic)
    )
    persona = result.scalar_one_or_none()

    is_valid = security.verify_password(data.contrasenya, persona.contrasenya)

    if not persona or not is_valid:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    rol = None

    usuari_result = await session.execute(
        select(UsuariDB).where(UsuariDB.persona_id == persona.id)
    )
    if usuari_result.scalar_one_or_none():
        rol = "usuari"
    else:
        admin_result = await session.execute(
            select(AdministradorDB).where(AdministradorDB.persona_id == persona.id)
        )
        if admin_result.scalar_one_or_none():
            rol = "administrador"

    if rol is None:
        raise HTTPException(status_code=403, detail="Role not found for the user")

    token_data = {"sub": str(persona.id), "rol": rol}
    token = create_access_token(data=token_data)

    #return LoginResponse(
    #    access_token=token,
    #    persona_id=persona.id,
    #    rol=rol
    #)

    return JSONResponse(
    content={
        "access_token": token,
        "persona_id": persona.id,
        "rol": rol
    }
)
