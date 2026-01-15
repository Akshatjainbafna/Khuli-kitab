"""
Configuration module for the Flask RAG application.
Loads environment variables and defines application settings.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Force disable ChromaDB telemetry
os.environ["ANONYMIZED_TELEMETRY"] = "False"
os.environ["CHROMA_TELEMETRY_IMPL"] = "chromadb.telemetry.posthog.Posthog" # sometimes needed or try to mock it?
# Actually just ANONYMIZED_TELEMETRY=False is usually enough.


class Config:
    """Application configuration settings."""
    
    # Flask settings
    DEBUG = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    HOST = os.getenv("FLASK_HOST", "0.0.0.0")
    PORT = int(os.getenv("FLASK_PORT", 5000))
    # Public URL (Ngrok)
    ENABLE_NGROK = os.getenv("ENABLE_NGROK", "False").lower() == "true"
    NGROK_AUTH_TOKEN = os.getenv("NGROK_AUTH_TOKEN")

    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    
    # Google Gemini settings
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    # LLM Model
    GOOGLE_MODEL = os.getenv("GOOGLE_MODEL", "gemini-2.5-flash")
    # Embedding Model
    GOOGLE_EMBEDDING_MODEL = os.getenv("GOOGLE_EMBEDDING_MODEL", "models/text-embedding-004")
    
    # ChromaDB settings
    CHROMA_PERSIST_DIRECTORY = os.getenv(
        "CHROMA_PERSIST_DIRECTORY", 
        os.path.join(os.path.dirname(__file__), "chroma_db")
    )
    CHROMA_COLLECTION_NAME = os.getenv("CHROMA_COLLECTION_NAME", "documents")
    
    # Document processing settings
    CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 1000))
    CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", 200))
    
    # Upload settings
    UPLOAD_FOLDER = os.getenv(
        "UPLOAD_FOLDER",
        os.path.join(os.path.dirname(__file__), "uploads")
    )
    ALLOWED_EXTENSIONS = {"pdf", "txt", "docx", "md"}
    
    @classmethod
    def validate(cls) -> bool:
        """Validate required configuration settings."""
        if not cls.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        return True
