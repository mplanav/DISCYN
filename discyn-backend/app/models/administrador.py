from sqlalchemy import Column, Integer, String, ForeignKey
from ..database import Base
from sqlalchemy.orm import relationship

class AdministradorDB(Base):
    __tablename__ = "administrador"

    persona_id = Column(Integer, ForeignKey("persona.id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)
    llicencia = Column(String(50), nullable=False, unique=True)
    
    persona = relationship("PersonaDB", back_populates="administrador")