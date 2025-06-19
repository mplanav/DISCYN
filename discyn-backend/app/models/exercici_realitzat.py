from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from ..database import Base
from sqlalchemy.orm import relationship

class ExerciciRealitzatDB(Base):
    __tablename__ = "exercicirealitzat"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ordre = Column(Integer, nullable=False)
    rutina_id = Column(Integer, ForeignKey("rutina.id", ondelete="RESTRICT"), nullable=False)
    exercici_nom = Column(String(50), ForeignKey("exercici.nom", ondelete="RESTRICT"), nullable=False)

    # Relaciones con hipertrofia y rendimiento
    hipertrofia = relationship("HipertrofiaDB", back_populates="exercicir", uselist=False)
    rendiment = relationship("RendimentDB", back_populates="exercicir", uselist=False)

    __table_args__ = (
        UniqueConstraint("id", "ordre", name="uq_exercici_ordre"),
    )
