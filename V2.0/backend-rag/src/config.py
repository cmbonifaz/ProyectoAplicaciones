import os
from dotenv import load_dotenv
from llama_index.core import Settings
from llama_index.llms.groq import Groq
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

load_dotenv()

# Rutas compatibles con Windows/Linux
DB_PATH = os.path.join("data", "chroma_db")
COLLECTION_NAME = "documentos_usuario"

def setup_app_settings():
    """Configuración global de modelos."""
    Settings.llm = Groq(
        model="llama-3.3-70b-versatile", 
        api_key=os.getenv("GROQ_API_KEY")
    )
    
    # Modelo de embeddings local (se descargará en tu C:\Users\Nombre\.cache)
    Settings.embed_model = HuggingFaceEmbedding(
        model_name="BAAI/bge-small-en-v1.5"
    )