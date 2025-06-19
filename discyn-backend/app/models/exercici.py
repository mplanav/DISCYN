from sqlalchemy import Column, Integer, String, ForeignKey, CheckConstraint
from ..database import Base


class ExerciciDB(Base):
    __tablename__ = "exercici"

    nom = Column(String(50), primary_key=True)
    imatge = Column(String(255), nullable=False)
    usuari_id = Column(Integer, ForeignKey("usuari.persona_id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True)
    admin_id = Column(Integer, ForeignKey("administrador.persona_id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True)

    __table_args__ = (
        CheckConstraint(
            "(usuari_id IS NOT NULL AND admin_id IS NULL) OR (usuari_id IS NULL AND admin_id IS NOT NULL)",
            name="check_owner"
        ),
    )
