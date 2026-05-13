import chromadb
import os
from typing import List
from llama_index.core import VectorStoreIndex
from llama_index.core.vector_stores import MetadataFilters, MetadataFilter
from llama_index.core.vector_stores.types import FilterOperator
from llama_index.vector_stores.chroma import ChromaVectorStore
from src.config import DB_PATH, COLLECTION_NAME

def consultar_chat(pregunta: str, archivos: List[str] | None = None):
    db = chromadb.PersistentClient(path=DB_PATH)
    chroma_collection = db.get_or_create_collection(COLLECTION_NAME)
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    index = VectorStoreIndex.from_vector_store(vector_store)
    
    system_prompt = (
        "REGLA CRÍTICA: Responde ÚNICAMENTE usando la información del contexto proporcionado. "
        "Si la información no está presente en los documentos, responde exactamente: "
        "'Lo siento, la respuesta no se encuentra en los documentos oficiales.' "
        "No utilices conocimiento externo ni inventes detalles sobre la Universidad ESPE."
    )
    
    # Aplicar filtro si el usuario seleccionó archivos específicos
    filters = None
    if archivos:
        filters = MetadataFilters(filters=[MetadataFilter(key="source_file", value=archivos, operator=FilterOperator.IN)])

    query_engine = index.as_query_engine(
        system_prompt=system_prompt,
        filters=filters,
        response_mode="compact",
        similarity_top_k=3
    )
    
    response = query_engine.query(pregunta)
    return str(response)