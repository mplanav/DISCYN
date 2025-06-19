from sqlalchemy import Column, Integer, String, ForeignKey, PrimaryKeyConstraint
from ..database import Base


class RutinaGrupMuscularDB(Base):
    __tablename__ = "rutina_grupmuscular"

    rutina_id = Column(Integer, ForeignKey("rutina.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    grupmuscular_nom = Column(String(50), ForeignKey("grupmuscular.nom", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("rutina_id", "grupmuscular_nom"),
    )
