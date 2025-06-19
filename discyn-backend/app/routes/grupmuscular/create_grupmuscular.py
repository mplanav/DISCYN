from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_async_session
from app.models import GrupMuscularDB, AdministradorDB
from app.core import get_current_user, settings
import uuid
import os

create_grupmuscular_router = APIRouter()

grupmuscular_path = os.path.join(settings.UPLOAD_DIR, "grupmuscular")


@create_grupmuscular_router.post("/create")
async def create_grupmuscular(
    grupmuscular: str = Form(...),
    image: UploadFile = File(...),
    id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session)
):
    if image.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(status_code=400, detail="Image format not supported")
    
    result = await session.execute(
        select(AdministradorDB).where(AdministradorDB.persona_id == id)
    )
    admin = result.scalar_one_or_none()
    if admin is None: 
        raise HTTPException(status_code=404, detail="This user is not administrator")

    os.makedirs(grupmuscular_path, exist_ok=True)
    ext = image.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(grupmuscular_path, unique_filename)

    with open(file_path, "wb") as f:
        f.write(await image.read())

    relative_path = f"/static/images/grupmuscular/{unique_filename}"

    new_grupmuscular = GrupMuscularDB(
        nom=grupmuscular,
        imatge=relative_path,
        admin_id=id
    )
    session.add(new_grupmuscular)

    try:
        await session.commit()
    except Exception as e:
        await session.rollback()
        raise e

    return {
        "message": f"Grup muscular '{grupmuscular}' created successfully.",
        "imatge_url": relative_path
    }
