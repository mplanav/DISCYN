from sqlalchemy import Column, Integer, String, ForeignKey, CheckConstraint
from ..database import Base
from sqlalchemy.orm import relationship

class RutinaDB(Base):
    __tablename__ = "rutina"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(50), nullable=False)
    admin_id = Column(Integer, ForeignKey("administrador.persona_id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True)
    user_id = Column(Integer, ForeignKey("usuari.persona_id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True)

    entrenos = relationship("EntrenoDB", back_populates="rutina")

    __table_args__ = (
        CheckConstraint(
            "(admin_id IS NOT NULL AND user_id IS NULL) OR (admin_id IS NULL AND user_id IS NOT NULL)",
            name="check_rutina_owner"
        ),
    )
