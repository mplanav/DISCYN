from app import app
from app.routes.persona.auth.login import login_router
from app.routes.persona.auth.register import register_router
from app.routes.gymbro import add_gymbro, get_gymbro_trainings, get_gymbros, delete_gymbro
from app.routes.grupmuscular import create_grupmuscular
from app.routes.rutines import get_frequent_rutines, create_rutines, get_visible_rutines, delete_rutina, update_rutina
from app.routes.exercicis import create_exercici
from app.routes.entrenos import create_entreno, create_entreno_from_rutina, get_entreno, read_entreno, delete_entreno, update_entreno, list_user_entrenos, stats_entreno
from app.routes.usuari import search_users
from app.routes.ExerciciEntreno import add_exercici_entreno, delete_exercici_entreno, list_exercici_entreno, update_exercici_entreno
import traceback
from fastapi import Request
