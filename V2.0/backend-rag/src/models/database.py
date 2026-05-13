from sqlalchemy import create_engine, Column, String, ForeignKey, Table, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
import uuid

Base = declarative_base()

# Tabla intermedia
chat_files = Table(
    'chat_files', Base.metadata,
    Column('conversation_id', String, ForeignKey('conversations.id')),
    Column('file_id', String, ForeignKey('files.id'))
)

class Conversation(Base):
    __tablename__ = 'conversations'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    files = relationship("FileModel", secondary=chat_files, back_populates="conversations")
    # Nueva relación para el historial
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = 'messages'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    role = Column(String, nullable=False)  # 'user' o 'assistant'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    conversation_id = Column(String, ForeignKey('conversations.id'))
    
    conversation = relationship("Conversation", back_populates="messages")

class FileModel(Base):
    __tablename__ = 'files'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False, unique=True)
    file_hash = Column(String, unique=True)
    path = Column(String, nullable=False)
    
    conversations = relationship("Conversation", secondary=chat_files, back_populates="files")

# Configuración (Asegúrate de que la carpeta /data exista)
engine = create_engine('sqlite:///data/manager.db', connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)