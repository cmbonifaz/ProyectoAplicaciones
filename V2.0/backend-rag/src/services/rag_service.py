# backend-rag/src/services/rag_service.py

import os
import chromadb
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex, StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
from src.config import DB_PATH, COLLECTION_NAME

def procesar_archivos_uploads():
    ruta_uploads = os.path.abspath("uploads") 
    
    if not os.path.exists(ruta_uploads):
        return {"error": f"La carpeta {ruta_uploads} no existe."}

    # 1. Leer los PDFs
    reader = SimpleDirectoryReader(input_dir=ruta_uploads, required_exts=[".pdf"])
    documents = reader.load_data()

    if not documents:
        return {"error": "No se encontraron documentos válidos."}

    # 2. Conectar con ChromaDB para persistirlos
    db = chromadb.PersistentClient(path=DB_PATH)
    chroma_collection = db.get_or_create_collection(COLLECTION_NAME)
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    # 3. Crear el índice (Esto es lo que tarda, pero solo se hace al subir archivos)
    index = VectorStoreIndex.from_documents(documents, storage_context=storage_context)
    
    return {"status": "success", "mensajes": f"Procesados {len(documents)} fragmentos."}