from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_
from app.database import get_async_session
from app.models import GymbroDB
from app.core import get_current_user

list_pending_router = APIRouter()

@list_pending_router.get("/pending")
async def list_pending_requests(
    session: AsyncSession = Depends(get_async_session),
    current_user_id: int = Depends(get_current_user)
):
    # Buscar solicitudes pendientes donde el usuario es parte
    result = await session.execute(
        select(GymbroDB).where(
            and_(
                GymbroDB.status == "pending",
                or_(
                    GymbroDB.usuari1_id == current_user_id,
                    GymbroDB.usuari2_id == current_user_id
                )
            )
        )
    )
    pending_requests = result.scalars().all()

    response = []
    for req in pending_requests:
        response.append({
            "usuari1_id": req.usuari1_id,
            "usuari2_id": req.usuari2_id,
            "status": req.status,
            "requester_id": req.requester_id,
            "is_requester": (req.requester_id == current_user_id),
            "other_user_id": req.usuari2_id if req.requester_id == req.usuari1_id else req.usuari1_id
        })

    return {"pending_requests": response}
