from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    correuelectronic: EmailStr
    contrasenya: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    persona_id: int
    rol: str 

    