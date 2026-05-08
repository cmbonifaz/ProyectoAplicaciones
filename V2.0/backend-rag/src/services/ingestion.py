import os
import chromadb
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
from src.config import DB_PATH, COLLECTION_NAME

def procesar_y_almacenar(directorio_archivos: str):
    # Cargar documentos del directorio
    reader = SimpleDirectoryReader(directorio_archivos)
    documents = reader.load_data()

    # Limpiar metadatos para que el filtro por nombre de archivo funcione
    for doc in documents:
        file_path = doc.metadata.get("file_path") or doc.metadata.get("file_name") or ""
        doc.metadata["source_file"] = os.path.basename(file_path)

    # Conexión a ChromaDB
    db = chromadb.PersistentClient(path=DB_PATH)
    chroma_collection = db.get_or_create_collection(COLLECTION_NAME)
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    # Indexación
    index = VectorStoreIndex.from_documents(documents, storage_context=storage_context)
    return len(documents)