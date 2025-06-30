from sqlalchemy import Column, Integer, String, ForeignKey, CheckConstraint, PrimaryKeyConstraint
from sqlalchemy.orm import relationship
from ..database import Base

class GymbroDB(Base):
    __tablename__ = "gymbro"

    usuari1_id = Column(Integer, ForeignKey("usuari.persona_id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)
    usuari2_id = Column(Integer, ForeignKey("usuari.persona_id", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)
    status = Column(String, nullable=False, default="pending")
    requester_id = Column(Integer, ForeignKey("usuari.persona_id"))

    __table_args__ = (
        PrimaryKeyConstraint("usuari1_id", "usuari2_id"),
        CheckConstraint("usuari1_id < usuari2_id", name="check_gymbro_order"),
    )

    usuari1 = relationship("UsuariDB", foreign_keys=[usuari1_id])
    usuari2 = relationship("UsuariDB", foreign_keys=[usuari2_id])