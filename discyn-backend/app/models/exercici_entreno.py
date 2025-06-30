from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from ..database import Base

class ExerciciEntrenoDB(Base):
    __tablename__ = "exercici_entreno"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ordre = Column(Integer, nullable=False)
    entreno_id = Column(Integer, ForeignKey("entreno.entreno_id", ondelete="CASCADE"), nullable=False)
    exercici_nom = Column(String(50), ForeignKey("exercici.nom", ondelete="RESTRICT"), nullable=False)
    # Series y repeticiones

    # Relaciones opcionales para facilitar consultas con ORM
    entreno = relationship("EntrenoDB", back_populates="exercicis_entreno")
    exercici = relationship("ExerciciDB")

    __table_args__ = (
        # Unicidad para que no haya dos ejercicios con mismo orden en un entreno
        UniqueConstraint('entreno_id', 'ordre', name='uq_entreno_ordre'),
    )
