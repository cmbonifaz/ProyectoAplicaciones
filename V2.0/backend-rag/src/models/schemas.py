from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    pregunta: str
    chat_id: str  # <--- Agrega esta línea para solucionar el error de Pylance
    archivos: Optional[List[str]] = None

class ChatResponse(BaseModel):
    respuesta: str