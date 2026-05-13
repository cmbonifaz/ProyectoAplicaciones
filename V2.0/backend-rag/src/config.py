import os
from dotenv import load_dotenv
from llama_index.core import Settings
from llama_index.llms.groq import Groq
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.node_parser import SentenceSplitter

load_dotenv()

# Rutas separadas para evitar conflictos
# BASE_DIR ayuda a que funcione igual en Windows y tu Arch Linux
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "chroma_db")  # Base de datos fuera de 'data'
DATA_PATH = os.path.join(BASE_DIR, "data")     # Solo PDFs aquí
COLLECTION_NAME = "documentos_usuario"

def setup_app_settings():
    """Configuración global de modelos optimizada para la ESPE."""
    
    # Configuración del LLM con Temperatura 0 para evitar alucinaciones
    Settings.llm = Groq(
        model="llama-3.3-70b-versatile", 
        api_key=os.getenv("GROQ_API_KEY"),
        temperature=0.0  # Mantenemos temperatura 0 para evitar alucinaciones
    )
    
    # Configuración del modelo de Embedding (Multilingüe para español)
    # Solo una vez es necesario declararlo
    Settings.embed_model = HuggingFaceEmbedding(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )
    
    # Configuración de fragmentación (Chunking)
    # Esto ayuda a que el modelo reciba fragmentos con sentido completo
    Settings.node_parser = SentenceSplitter(
        chunk_size=512, 
        chunk_overlap=50
    )
