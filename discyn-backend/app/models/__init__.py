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
from .hipertrofia import HipertrofiaDB
from .serie_classica import SerieClassicaDB
from .rendiment import RendimentDB
from .serie_rendiment import SerieRendimentDB

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
    "HipertrofiaDB",
    "SerieClassicaDB",
    "RendimentDB",
    "SerieRendimentDB",
]