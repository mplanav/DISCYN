from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Union, Literal
from datetime import datetime, time


# --- Output model for an Entreno (used in responses) ---
class EntrenoOut(BaseModel):
    entreno_id: int
    usuari_id: int
    rutina_id: int
    pestotal: Optional[float] = None
    duraciototal: time
    sensacions: Optional[str] = None
    datahora: datetime

    class Config:
        from_attributes = True


# --- Input models for updating training series ---
class SerieClassicaData(BaseModel):
    num: int = Field(..., gt=0)
    pes: float
    repeticions: int


class SerieRendimentData(BaseModel):
    num: int = Field(..., gt=0)
    temps: str = Field(..., pattern=r"^\d{2}:\d{2}:\d{2}$")
    distancia: Optional[int] = None


class SerieUpdate(BaseModel):
    exercicir_id: int
    tipus: Literal["classica", "rendiment"]
    dades: List[Union[SerieClassicaData, SerieRendimentData]]

    @model_validator(mode="after")
    def validate_dades_match_tipus(self) -> "SerieUpdate":
        if self.tipus == "classica":
            if not all(isinstance(d, SerieClassicaData) for d in self.dades):
                raise ValueError("Todos los elementos en 'dades' deben ser de tipo SerieClassicaData para 'classica'")
        elif self.tipus == "rendiment":
            if not all(isinstance(d, SerieRendimentData) for d in self.dades):
                raise ValueError("Todos los elementos en 'dades' deben ser de tipo SerieRendimentData para 'rendiment'")
        return self


class EntrenoUpdate(BaseModel):
    pestotal: float
    duraciototal: str = Field(..., pattern=r"^\d{2}:\d{2}:\d{2}$")  # formato HH:MM:SS
    sensacions: Optional[str] = None
    series: List[SerieUpdate]
