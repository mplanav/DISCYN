from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

class Persona(BaseModel):
    id : Optional[int]
    nom: str
    correuelectronic: EmailStr
    imatge: str | None = None

class PersonaUsuariAdmin(BaseModel):
    nom: str
    correuelectronic: EmailStr
    contrasenya: str
    datanaixement: Optional[date]
    genere: Optional[str] = None
    rol: str
    altura: Optional[float]
    pes: Optional[float]
    llicencia: Optional[str]

class PersonaRead(BaseModel):
    id: int
    nom: str
    correuelectronic: EmailStr
    datanaixement: Optional[date] = None
    genere: Optional[str] = None
    imatge: Optional[str] = None

class PersonaUpdateName(BaseModel):
    nom: str

class PersonaUpdatePassword(BaseModel):
    password: str
    new_password: str

class PersonaUpdateDate(BaseModel):
    date: date

class PersonaUpdateGender(BaseModel):
    gender: str

