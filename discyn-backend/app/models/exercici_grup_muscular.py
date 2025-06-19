from sqlalchemy import Column, String, ForeignKey
from ..database import Base


class ExerciciGrupMuscularDB(Base):
    __tablename__ = "exercici_grupmuscular"

    exercici_nom = Column(String(50), ForeignKey("exercici.nom", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)
    grupmuscular_nom = Column(String(50), ForeignKey("grupmuscular.nom", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)