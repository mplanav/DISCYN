from sqlalchemy import Column, Integer, Float, String, ForeignKey, PrimaryKeyConstraint
from ..database import Base

class SerieClassicaDB(Base):
    __tablename__ = "serieclassica"

    hipertrofia_id = Column(Integer, ForeignKey("hipertrofia.exercicir_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    num = Column(Integer, nullable=False)
    pes = Column(Float, nullable=False)
    tipus = Column(String(20), nullable=False)
    repeticions = Column(Integer, nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("hipertrofia_id", "num"),
    )