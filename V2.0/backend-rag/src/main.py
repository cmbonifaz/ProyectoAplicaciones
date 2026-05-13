import os
import shutil
from typing import cast, List
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from sqlalchemy.orm import Session

# Importaciones de tu estructura modular
from src.config import setup_app_settings, DB_PATH
from src.services.ingestion import procesar_y_almacenar
from src.services.chat import consultar_chat
from src.models.schemas import ChatRequest, ChatResponse
# Importaciones de la Base de Datos
from src.models.database import SessionLocal, init_db, Conversation, FileModel, Message

# Cargar variables de entorno y configurar modelos
load_dotenv()
setup_app_settings()

# Inicializar la base de datos SQLite al arrancar
init_db()

app = FastAPI(title="Backend RAG ESPE - Gestor de Conversaciones")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas de archivos
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Dependencia para obtener la sesión de la DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- ENDPOINTS DE CONVERSACIONES ---

@app.post("/conversations")
def create_conversation(title: str, db: Session = Depends(get_db)):
    """Crea una nueva sesión de chat."""
    new_chat = Conversation(title=title)
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return {"id": new_chat.id, "title": new_chat.title}

@app.get("/conversations")
def list_conversations(db: Session = Depends(get_db)):
    """Lista todas las conversaciones guardadas."""
    return db.query(Conversation).all()

@app.delete("/conversations/{chat_id}")
def delete_conversation(chat_id: str, db: Session = Depends(get_db)):
    """Elimina una conversación y su historial."""
    chat_obj = db.query(Conversation).filter(Conversation.id == chat_id).first()
    if not chat_obj:
        raise HTTPException(status_code=404, detail="Chat no encontrado")

    db.delete(chat_obj)
    db.commit()
    return {"message": f"Conversación {chat_id} eliminada."}

# --- NUEVO: ENDPOINT PARA HISTORIAL (Soluciona el error 404) ---
@app.get("/conversations/{chat_id}/messages")
async def get_chat_messages(chat_id: str, db: Session = Depends(get_db)):
    """Obtiene los mensajes guardados de una conversación."""
    chat_obj = db.query(Conversation).filter(Conversation.id == chat_id).first()
    if not chat_obj:
        raise HTTPException(status_code=404, detail="Chat no encontrado")
    
    # Retorna la lista de mensajes asociados al chat
    return [{"role": m.role, "content": m.content} for m in chat_obj.messages]

# --- ENDPOINTS DE RAG Y ARCHIVOS ---

# Ubicación: main.py
@app.get("/conversations/{chat_id}/files")
async def get_chat_files(chat_id: str, db: Session = Depends(get_db)):
    """Obtiene los archivos vinculados a este chat."""
    chat_obj = db.query(Conversation).filter(Conversation.id == chat_id).first()
    if not chat_obj:
        return []
    # Devolvemos una lista de objetos con la llave 'name'
    return [{"name": f.filename} for f in chat_obj.files]

@app.post("/conversations/{chat_id}/remove-file/{filename}")
async def remove_file_from_chat(chat_id: str, filename: str, db: Session = Depends(get_db)):
    """Elimina la relación entre un archivo y un chat específico."""
    chat_obj = db.query(Conversation).filter(Conversation.id == chat_id).first()
    if not chat_obj:
        raise HTTPException(status_code=404, detail="Chat no encontrado")
    
    file_obj = db.query(FileModel).filter(FileModel.filename == filename).first()
    if file_obj and file_obj in chat_obj.files:
        chat_obj.files.remove(file_obj)
        db.commit()
        return {"message": f"Archivo {filename} desvinculado del chat {chat_id}"}
    
    raise HTTPException(status_code=404, detail="El archivo no está vinculado a este chat")

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """Procesa el chat, guarda el historial y actualiza títulos."""
    try:
        # 1. Buscar la conversación
        chat_obj = db.query(Conversation).filter(Conversation.id == request.chat_id).first()
        if not chat_obj:
            raise HTTPException(status_code=404, detail="Conversación no encontrada")

        # 2. GUARDAR PREGUNTA DEL USUARIO EN LA DB
        user_msg = Message(role="user", content=request.pregunta, conversation_id=chat_obj.id)
        db.add(user_msg)

        # 3. Lógica de auto-título
        if "Sesión" in chat_obj.title or "Chat" in chat_obj.title:
            nuevo_titulo = " ".join(request.pregunta.split()[:6]) + "..."
            setattr(chat_obj, "title", nuevo_titulo)

        # 4. Filtrar archivos y consultar RAG
        archivos_permitidos = [f.filename for f in chat_obj.files]
        res_texto = consultar_chat(request.pregunta, archivos_permitidos)
        
        # 5. GUARDAR RESPUESTA DE LA IA EN LA DB
        bot_msg = Message(role="assistant", content=res_texto, conversation_id=chat_obj.id)
        db.add(bot_msg)

        db.commit()
        return ChatResponse(respuesta=res_texto)
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error en Chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload/{chat_id}")
async def upload(chat_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Sube un archivo y lo vincula a una conversación."""
    chat_obj = db.query(Conversation).filter(Conversation.id == chat_id).first()
    if not chat_obj:
        raise HTTPException(status_code=404, detail="Chat no encontrado")

    safe_filename = cast(str, file.filename)
    temp_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_db = db.query(FileModel).filter(FileModel.filename == safe_filename).first()
        if not file_db:
            file_db = FileModel(filename=safe_filename, path=temp_path)
            db.add(file_db)
        
        if file_db not in chat_obj.files:
            chat_obj.files.append(file_db)
            db.commit()

        procesar_y_almacenar(UPLOAD_DIR)
        return {"message": f"'{safe_filename}' vinculado al chat {chat_id}"}
    
    except Exception as e:
        print(f"❌ Error en Upload: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/files/{filename}")
async def get_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='application/pdf')
    raise HTTPException(status_code=404, detail="Archivo no encontrado")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)