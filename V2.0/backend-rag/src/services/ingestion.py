import os
import chromadb
from llama_index.core import (
    VectorStoreIndex, 
    SimpleDirectoryReader, 
    StorageContext,
    Settings
)
from llama_index.core.node_parser import SentenceSplitter
from llama_index.vector_stores.chroma import ChromaVectorStore
from src.config import DB_PATH, COLLECTION_NAME

def procesar_y_almacenar(directorio_archivos: str):
    # 1. Configuración de Procesamiento (Evita alucinaciones por cortes de texto)
    Settings.node_parser = SentenceSplitter(
        chunk_size=512,  
        chunk_overlap=50  
    )

    # 2. Cargar documentos
    reader = SimpleDirectoryReader(input_dir=directorio_archivos, recursive=True)
    documents = reader.load_data()

    # 3. Limpiar y asegurar metadatos para los filtros
    for doc in documents:
        
        actual_name = os.path.basename(doc.metadata.get("file_name", "desconocido"))
        doc.metadata = {
            "source_file": actual_name,
            "universidad": "ESPE" 
        }


    db = chromadb.PersistentClient(path=DB_PATH)
    chroma_collection = db.get_or_create_collection(COLLECTION_NAME)
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    # 5. Indexación (con verificación de duplicados simplificada)
    # Si la colección ya tiene datos, podrías querer usar 'insert' en lugar de recrear
    index = VectorStoreIndex.from_documents(
        documents, 
        storage_context=storage_context,
        show_progress=True
    )
    
    return len(documents)