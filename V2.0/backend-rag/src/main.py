from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import cast
import shutil
import os

# Importaciones de tu estructura modular
from src.config import setup_app_settings
from src.services.ingestion import procesar_y_almacenar
from src.services.chat import consultar_chat
from src.models.schemas import ChatRequest, ChatResponse

app = FastAPI(title="Backend RAG - Software Engineering ESPE")

# 1. Configuración inicial de LlamaIndex y Modelos
setup_app_settings()

# 2. CORS: Configuración para permitir conexión con Flutter
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Endpoint para realizar consultas al RAG."""
    try:
        # Llamada al servicio de chat pasándole la pregunta y el filtro opcional
        res = consultar_chat(request.pregunta, request.archivos)
        return ChatResponse(respuesta=res)
    except Exception as e:
        # Log del error para depuración en consola
        print(f"Error en Chat: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    """Endpoint para subir e indexar archivos en la base vectorial."""
    
    # VALIDACIÓN: Solución al error de Pylance (Type Safety)
    if not file.filename:
        raise HTTPException(status_code=400, detail="El archivo no tiene un nombre válido.")

    # Definir rutas compatibles con Windows usando os.path.join
    upload_dir = os.path.join("data", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Aseguramos que filename sea tratado como string para os.path.join
    safe_filename = cast(str, file.filename)
    temp_path = os.path.join(upload_dir, safe_filename)
    
    try:
        # Guardar el archivo físicamente en el servidor
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Procesar el archivo con LlamaIndex e indexar en ChromaDB
        num_docs = procesar_y_almacenar(upload_dir)
        
        # RECOMENDACIÓN: Borrar el archivo temporal después de indexar 
        # para que ChromaDB sea la única fuente de verdad y ahorrar espacio.
        # Comentado para permitir previsualización
        # if os.path.exists(temp_path):
        #     os.remove(temp_path)
            
        return {"message": f"Archivo '{safe_filename}' indexado correctamente."}
    
    except Exception as e:
        # Limpieza en caso de error para no dejar archivos corruptos
        if os.path.exists(temp_path):
            os.remove(temp_path)
        print(f"Error en Upload: {e}")
        raise HTTPException(status_code=500, detail=f"Error al procesar archivo: {str(e)}")

@app.get("/files/{filename}")
async def get_file(filename: str):
    """Endpoint para servir archivos PDF para previsualización."""
    file_path = os.path.join("data", "uploads", filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='application/pdf')
    else:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

if __name__ == "__main__":
    import uvicorn
    # Levantamos el servidor en localhost puerto 8000
    uvicorn.run(app, host="127.0.0.1", port=8000)