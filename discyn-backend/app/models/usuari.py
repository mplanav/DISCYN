from sqlalchemy import Column, Integer, Float, ForeignKey
from ..database import Base
from sqlalchemy.orm import relationship

class UsuariDB(Base):
    __tablename__ = "usuari"

    persona_id = Column(Integer, ForeignKey("persona.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)
    altura = Column(Float, nullable=True)
    pes = Column(Float, nullable=True)

    persona = relationship("PersonaDB", back_populates="usuari")