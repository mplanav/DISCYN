from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse  
from contextlib import asynccontextmanager
from app.database import init_db
from fastapi import FastAPI
from app import routes
from fastapi.staticfiles import StaticFiles
from app.routes.gymbro import add_gymbro, get_gymbro_trainings, get_gymbros, delete_gymbro
from app.routes.persona import crud, auth
from app.routes.grupmuscular import create_grupmuscular
from app.routes.rutines import get_frequent_rutines, create_rutines, get_visible_rutines
from app.routes.exercicis import create_exercici
from app.routes.entrenos import create_entreno, create_entreno_from_rutina, update_entreno_classic, update_entreno_rendiment, get_entreno
from app.routes.grupmuscular import create_grupmuscular,read_grupmuscular
from app.routes.rutines import get_frequent_rutines, create_rutines, get_visible_rutines, read_rutines
from app.routes.exercicis import create_exercici, read_exercici
from app.routes.entrenos import create_entreno, create_entreno_from_rutina, read_entreno
from app.routes.usuari import search_users
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield 

app = FastAPI(
    title="Discyn",
    description="Gym Application",
    version="1.0.0",
    lifespan=lifespan,
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/static",
    StaticFiles(directory=os.path.join(os.path.dirname(__file__), "..", "static")),
    name="static"
)

@app.get("/")
async def root():
    return RedirectResponse(url="/auth/login")


# AUTH ROUTES
app.include_router(auth.register.register_router, prefix="/auth", tags=["auth"])
app.include_router(auth.login.login_router, prefix="/auth", tags=["auth"])
# GYMBRO ROUTES
app.include_router(add_gymbro.add_gymbro_router, prefix="/gymbro", tags=["gymbro"])
app.include_router(get_gymbro_trainings.get_gymbroTraining, prefix="/gymbro", tags=["gymbro"])
app.include_router(get_gymbros.get_gymbros_router, prefix="/gymbro", tags=["gymbro"])
app.include_router(delete_gymbro.delete_gymbro_router, prefix="/gymbro", tags=["gymbro"])
# CRUD PERSONA ROUTES
app.include_router(crud.read_persona.read_persona_router, prefix="/persona/read", tags=["persona"])
app.include_router(crud.update_persona.update_persona_router, prefix="/persona/update", tags=["persona"])
app.include_router(crud.delete_persona.delete_persona_router, prefix="/persona/delete", tags=["persona"])

#CRUD GRUP MUSCULAR
app.include_router(create_grupmuscular.create_grupmuscular_router, prefix="/grupmuscular", tags=["grupmuscular"])
app.include_router(read_grupmuscular.read_grupmuscular_router, prefix="/grupmuscular", tags=["grupmuscular"])

#CRUD RUTINES
app.include_router(create_rutines.create_rutina_router, prefix="/rutines", tags=["rutines"])

#RUTINES ROUTES
app.include_router(get_frequent_rutines.frequent_rutines_router, prefix="/rutines", tags=["rutines"])
app.include_router(get_visible_rutines.get_visible_rutines_router, prefix="/rutines", tags=["rutines"])
app.include_router(read_rutines.read_rutines_router, prefix="/rutines", tags=["rutines"])

#CRUD EXERCICIS 
app.include_router(create_exercici.create_exercici_router, prefix="/exercicis", tags=["exercicis"])
app.include_router(read_exercici.read_exercici_router, prefix="/exercicis", tags=["exercicis"])
#CRUD ENTRENOS
app.include_router(create_entreno.create_entreno_router, prefix="/entrenos", tags=["entrenos"])
app.include_router(create_entreno_from_rutina.create_entreno_from_rutina_router, prefix="/entrenos", tags=["entrenos"])
app.include_router(update_entreno_classic.update_entreno_classic_router, prefix="/entrenos", tags=["entrenos"])
app.include_router(update_entreno_rendiment.update_entreno_rendiment_router, prefix="/entrenos", tags=["entrenos"])
app.include_router(get_entreno.get_entreno_router, prefix="/entrenos", tags=["entrenos"])
app.include_router(read_entreno.read_entreno_router, prefix="/entrenos", tags=["entrenos"])

#USUARIS
app.include_router(search_users.search_users_router, prefix="/usuaris", tags=["usuaris"])