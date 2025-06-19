from sqlalchemy import Column, Integer, String, Date
from ..database import Base
from sqlalchemy.orm import relationship


class PersonaDB(Base):
    __tablename__ = "persona"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nom = Column(String(50), nullable=False)
    correuelectronic = Column(String(50), unique=True, nullable=False)
    datanaixement = Column(Date, nullable=True)
    contrasenya = Column(String(255), nullable=False)
    genere = Column(String(10), nullable=True)
    imatge = Column(String(255), nullable=True)

    usuari = relationship("UsuariDB", back_populates="persona", uselist=False, passive_deletes=True)
    administrador = relationship("AdministradorDB", back_populates="persona", uselist=False, passive_deletes=True)