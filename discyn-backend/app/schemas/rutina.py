from typing import List, Optional
from pydantic import BaseModel

class RutinaUpdate(BaseModel):
    nom: Optional[str]
    exercicis: Optional[str]
    tipo: Optional[str]
