from sqlalchemy import Column, Integer, String, ForeignKey
from ..database import Base


class GrupMuscularDB(Base):
    __tablename__ = "grupmuscular"

    nom = Column(String(50), primary_key=True)
    imatge = Column(String(255), nullable=False)
    admin_id = Column(Integer, ForeignKey("administrador.persona_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)