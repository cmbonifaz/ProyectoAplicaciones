from pydantic import BaseModel
from typing import Optional, List

class ChatRequest(BaseModel):
    pregunta: str
    archivos: Optional[List[str]] = None

class ChatResponse(BaseModel):
    respuesta: str
    status: str = "success"