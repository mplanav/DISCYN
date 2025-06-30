from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProgresoCorporalBase(BaseModel):
    peso: Optional[float]
    cintura: Optional[float]
    pecho: Optional[float]
    brazo: Optional[float]
    imc: Optional[float]
    grasa_corporal: Optional[float]
    masa_muscular: Optional[float]

class ProgresoCorporalCreate(ProgresoCorporalBase):
    pass

class ProgresoCorporalUpdate(ProgresoCorporalBase):
    pass

class ProgresoCorporalOut(ProgresoCorporalBase):
    id: int
    usuari_id: int
    fecha: datetime

    class Config:
        orm_mode = True
