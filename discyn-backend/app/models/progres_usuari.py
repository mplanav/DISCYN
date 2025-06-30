from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base
from datetime import datetime

class ProgresCorporalDB(Base):
    __tablename__ = "progres_corporal"

    id = Column(Integer, primary_key=True, index=True)
    usuari_id = Column(Integer, ForeignKey("usuari.persona_id", ondelete="CASCADE"))
    fecha = Column(DateTime, default=datetime.utcnow)
    peso = Column(Float, nullable=True)
    cintura = Column(Float, nullable=True)
    pecho = Column(Float, nullable=True)
    brazo = Column(Float, nullable=True)

    imc = Column(Float, nullable=True)               # Índice de Masa Corporal
    grasa_corporal = Column(Float, nullable=True)    # Porcentaje de grasa corporal
    masa_muscular = Column(Float, nullable=True)     # Masa muscular en kg o %

    usuari = relationship("UsuariDB", back_populates="progres_corporal")
