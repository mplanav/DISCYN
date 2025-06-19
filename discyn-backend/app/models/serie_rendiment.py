from sqlalchemy import Column, Integer, Time, ForeignKey, PrimaryKeyConstraint
from ..database import Base

class SerieRendimentDB(Base):
    __tablename__ = "serierendiment"

    rendiment_id = Column(Integer, ForeignKey("rendiment.exercicir_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    num = Column(Integer, nullable=False)
    temps = Column(Time, nullable=False)
    distancia = Column(Integer)

    __table_args__ = (
        PrimaryKeyConstraint("rendiment_id", "num"),
    )