from app import app
from app.routes.persona.auth.login import login_router
from app.routes.persona.auth.register import register_router
from app.routes.gymbro import add_gymbro, get_gymbro_trainings, get_gymbros, delete_gymbro
from app.routes.grupmuscular import create_grupmuscular
from app.routes.rutines import get_frequent_rutines, create_rutines, get_visible_rutines
from app.routes.exercicis import create_exercici
from app.routes.entrenos import create_entreno, create_entreno_from_rutina, update_entreno_classic, update_entreno_rendiment, get_entreno
from app.routes.usuari import search_users
import traceback
from fastapi import Request
