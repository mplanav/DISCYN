from sqlalchemy import Column, Integer, ForeignKey
from ..database import Base
from sqlalchemy.orm import relationship

class HipertrofiaDB(Base):
    __tablename__ = "hipertrofia"

    exercicir_id = Column(Integer, ForeignKey("exercicirealitzat.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)

    exercicir = relationship("ExerciciRealitzatDB", back_populates="hipertrofia")
