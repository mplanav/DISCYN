from sqlalchemy import Column, Integer, Float, Text, Time, DateTime, ForeignKey
from ..database import Base
from sqlalchemy.orm import relationship

class EntrenoDB(Base):
    __tablename__ = "entreno"
    entreno_id = Column(Integer, primary_key=True)
    usuari_id = Column(Integer, ForeignKey("usuari.persona_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    rutina_id = Column(Integer, ForeignKey("rutina.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    pestotal = Column(Float)
    duraciototal = Column(Time, nullable=False)
    sensacions = Column(Text)
    datahora = Column(DateTime, nullable=False)

    rutina = relationship("RutinaDB", back_populates="entrenos")


