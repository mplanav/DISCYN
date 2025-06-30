from .persona import PersonaDB 
from .usuari import UsuariDB
from .administrador import AdministradorDB
from .gymbro import GymbroDB
from .grup_muscular import GrupMuscularDB
from .rutina import RutinaDB
from .rutina_grup_muscular import RutinaGrupMuscularDB
from .exercici import ExerciciDB
from .exercici_grup_muscular import ExerciciGrupMuscularDB
from .exercici_realitzat import ExerciciRealitzatDB
from .entreno import EntrenoDB
from .exercici_entreno import ExerciciEntrenoDB
from .progres_usuari import ProgresCorporalDB

__all__ = [
    "PersonaDB",
    "UsuariDB",
    "AdministradorDB",
    "GymbroDB",
    "GrupMuscularDB",
    "RutinaDB",
    "RutinaGrupMuscularDB",
    "ExerciciDB",
    "ExerciciGrupMuscularDB",
    "ExerciciRealitzatDB",
    "EntrenoDB",
    "ExerciciEntrenoDB",
    "ProgresCorporalDB"
]