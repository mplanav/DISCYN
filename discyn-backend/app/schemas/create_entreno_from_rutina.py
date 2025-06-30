# app/schemas/entreno_create_from_rutina.py (o donde prefieras)
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, time

class EntrenoCreateFromRutinaIn(BaseModel):
    pestotal: Optional[float] = 0.0
    duraciototal: Optional[time] = None
    sensacions: Optional[str] = ""
    datahora: Optional[datetime] = None
    recorregut: Optional[float] = None
