"""
FastAPI RAG Application

Main FastAPI application with REST API endpoints for:
- Health check
- Document ingestion
- RAG query
"""

import os
# Force disable ChromaDB telemetry before any other imports
os.environ["ANONYMIZED_TELEMETRY"] = "False"
os.environ["CHROMA_TELEMETRY"] = "false"

import shutil
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from werkzeug.utils import secure_filename

from config import Config
from rag import DocumentProcessor, VectorStoreManager, RAGChain, GoogleDriveClient


# Pydantic Models
class HealthResponse(BaseModel):
    status: str
    message: str

class TextIngestRequest(BaseModel):
    text: str
    metadata: Optional[Dict[str, Any]] = {}

class DirectoryIngestRequest(BaseModel):
    directory_path: str

class DriveIngestRequest(BaseModel):
    folder_id: str
    credentials_path: Optional[str] = "credentials.json"
    token_path: Optional[str] = "token.json"

class QueryRequest(BaseModel):
    question: str
    include_sources: bool = False

class QueryResponse(BaseModel):
    answer: str
    sources: Optional[List[Dict[str, Any]]] = None

class IngestResponse(BaseModel):
    message: str
    filename: Optional[str] = None
    chunks_created: int
    document_ids: List[str]

# Global components
components = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup: Validate config and initialize components
    try:
        Config.validate()
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        print("Configuration validated and directories ready.")
    except ValueError as e:
        print(f"Configuration Error: {e}")
        
    yield
    # Shutdown: Clean up if needed
    components.clear()

app = FastAPI(
    title="Khuli Kitab RAG API",
    description="RAG Pipeline API using LangChain, ChromaDB, and OpenAI",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependencies
def get_document_processor() -> DocumentProcessor:
    if "doc_processor" not in components:
        components["doc_processor"] = DocumentProcessor(
            chunk_size=Config.CHUNK_SIZE,
            chunk_overlap=Config.CHUNK_OVERLAP
        )
    return components["doc_processor"]

def get_vector_store() -> VectorStoreManager:
    if "vector_store" not in components:
        components["vector_store"] = VectorStoreManager(
            persist_directory=Config.CHROMA_PERSIST_DIRECTORY,
            collection_name=Config.CHROMA_COLLECTION_NAME,
            embedding_model=Config.GOOGLE_EMBEDDING_MODEL,
            google_api_key=Config.GOOGLE_API_KEY
        )
    return components["vector_store"]

def get_rag_chain(
    vector_store: VectorStoreManager = Depends(get_vector_store)
) -> RAGChain:
    if "rag_chain" not in components:
        components["rag_chain"] = RAGChain(
            vector_store_manager=vector_store,
            model_name=Config.GOOGLE_MODEL,
            google_api_key=Config.GOOGLE_API_KEY
        )
    return components["rag_chain"]

def get_drive_client() -> GoogleDriveClient:
    if "drive_client" not in components:
        # Note: In a real app, you might want to handle dynamic credentials
        # For now, we use default paths or environment variables
        components["drive_client"] = GoogleDriveClient(
            credentials_path="credentials.json",
            token_path="token.json"
        )
    return components["drive_client"]

def allowed_file(filename: str) -> bool:
    return "." in filename and \
        filename.rsplit(".", 1)[1].lower() in Config.ALLOWED_EXTENSIONS

# ========== Routes ==========

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "message": "FastAPI RAG API is running"
    }

@app.post("/ingest/file", response_model=IngestResponse)
async def ingest_file(
    file: UploadFile = File(...),
    doc_processor: DocumentProcessor = Depends(get_document_processor),
    vector_store: VectorStoreManager = Depends(get_vector_store)
):
    """
    Ingest a single file into the vector store.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")
    
    if not allowed_file(file.filename):
        print(f"File upload rejected: {file.filename} (Invalid extension)")
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {Config.ALLOWED_EXTENSIONS}"
        )
    
    try:
        print(f"Starting ingestion for file: {file.filename}")
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
        print(f"Saving temporary file to: {file_path}")
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process and embed
        print(f"Processing document: {filename}...")
        chunks = doc_processor.process_file(file_path)
        print(f"Document split into {len(chunks)} chunks.")
        
        print("Adding chunks to vector store...")
        ids = vector_store.add_documents(chunks)
        print(f"Successfully indexed {len(ids)} chunks for {filename}.")
        
        # Clean up temp file
        os.remove(file_path)
        print(f"Cleaned up temporary file: {file_path}")
        
        return {
            "message": "File ingested successfully",
            "filename": filename,
            "chunks_created": len(chunks),
            "document_ids": ids[:5]  # Return first 5 IDs
        }
        
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ingest/text", response_model=IngestResponse)
async def ingest_text(
    request: TextIngestRequest,
    doc_processor: DocumentProcessor = Depends(get_document_processor),
    vector_store: VectorStoreManager = Depends(get_vector_store)
):
    """
    Ingest raw text into the vector store.
    """
    try:
        chunks = doc_processor.process_text(
            text=request.text,
            metadata=request.metadata
        )
        ids = vector_store.add_documents(chunks)
        
        return {
            "message": "Text ingested successfully",
            "chunks_created": len(chunks),
            "document_ids": ids
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ingest/directory", response_model=IngestResponse)
async def ingest_directory(
    request: DirectoryIngestRequest,
    doc_processor: DocumentProcessor = Depends(get_document_processor),
    vector_store: VectorStoreManager = Depends(get_vector_store)
):
    """
    Ingest all documents from a directory.
    """
    if not os.path.isdir(request.directory_path):
        raise HTTPException(
            status_code=404,
            detail=f"Directory not found: {request.directory_path}"
        )
    
    try:
        chunks = doc_processor.process_directory(request.directory_path)
        ids = vector_store.add_documents(chunks)
        
        return {
            "message": "Directory ingested successfully",
            "filename": request.directory_path,
            "chunks_created": len(chunks),
            "document_ids": ids[:10]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ingest/google-drive", response_model=IngestResponse)
async def ingest_drive(
    request: DriveIngestRequest,
    drive_client: GoogleDriveClient = Depends(get_drive_client),
    doc_processor: DocumentProcessor = Depends(get_document_processor),
    vector_store: VectorStoreManager = Depends(get_vector_store)
):
    """
    Ingest PDF and Word files from a Google Drive folder.
    """
    try:
        # List files
        files = drive_client.list_files_in_folder(request.folder_id)
        print(files)
        print(request.folder_id)
        if not files:
             return {
                "message": "No compatible files found in drive folder",
                "chunks_created": 0,
                "document_ids": []
             }

        # Create temp directory for downloads
        temp_dir = os.path.join(Config.UPLOAD_FOLDER, f"drive_{request.folder_id}")
        os.makedirs(temp_dir, exist_ok=True)
        
        all_ids = []
        processed_count = 0
        
        for file_meta in files:
            file_id = file_meta['id']
            file_name = file_meta['name']
            safe_name = secure_filename(file_name)
            mime_type = file_meta.get('mimeType')
            
            # Skip if not PDF or Word or Google Doc
            if 'pdf' not in mime_type and 'document' not in mime_type:
                continue
            
            # For Google Docs, we export to DOCX, so ensure extension is correct
            if mime_type == 'application/vnd.google-apps.document':
                if not safe_name.endswith('.docx'):
                    safe_name += '.docx'
                
            dest_path = os.path.join(temp_dir, safe_name)
            
            # Download (handles export for Google Docs)
            drive_client.download_file(file_id, dest_path, mime_type=mime_type)
            
            # Process
            try:
                chunks = doc_processor.process_file(dest_path)
                ids = vector_store.add_documents(chunks)
                all_ids.extend(ids)
                processed_count += 1
            except Exception as e:
                print(f"Error processing drive file {file_name}: {e}")
                
        # Cleanup
        shutil.rmtree(temp_dir)
        
        return {
            "message": f"Successfully ingested {processed_count} files from Google Drive",
            "filename": f"Folder ID: {request.folder_id}",
            "chunks_created": len(all_ids), # Approximation if chunks not tracked per file here
            "document_ids": all_ids[:20]
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query", response_model=QueryResponse)
async def query(
    request: QueryRequest,
    rag_chain: RAGChain = Depends(get_rag_chain)
):
    """
    Query the RAG pipeline.
    """
    try:
        if request.include_sources:
            result = rag_chain.query_with_sources(request.question)
            return {
                "answer": result["answer"],
                "sources": result["sources"]
            }
        else:
            answer = rag_chain.query(request.question)
            return {"answer": answer}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/collection/stats")
async def collection_stats(
    vector_store: VectorStoreManager = Depends(get_vector_store)
):
    """Get statistics about the vector store collection."""
    try:
        return vector_store.get_collection_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/collection/reset")
async def reset_collection(
    vector_store: VectorStoreManager = Depends(get_vector_store)
):
    """Reset (delete) the entire collection."""
    try:
        vector_store.delete_collection()
        # Clear cached components to force re-initialization on next request
        components.pop("vector_store", None)
        components.pop("rag_chain", None)
        return {"message": "Collection reset successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/database/clean")
async def clean_database(
    vector_store: VectorStoreManager = Depends(get_vector_store)
):
    """Clean (reset) the database (Alias for DELETE /collection/reset)."""
    return await reset_collection(vector_store)



if __name__ == "__main__":
    import uvicorn
    
    if Config.ENABLE_NGROK:
        # Check for auth token
        if not Config.NGROK_AUTH_TOKEN:
            print("WARNING: ENABLE_NGROK is True but NGROK_AUTH_TOKEN is not set in .env")
        else:
            try:
                from pyngrok import ngrok, conf
                # Kill any existing tunnels to avoid "simultaneous sessions" errors if reloaded
                ngrok.kill()
                
                conf.get_default().auth_token = Config.NGROK_AUTH_TOKEN
                # Open a HTTP tunnel on the default port
                public_url = ngrok.connect(Config.PORT).public_url
                print(f" * ngrok tunnel \"{public_url}\" -> \"http://127.0.0.1:{Config.PORT}\"")
            except ImportError:
                 print("WARNING: pyngrok not installed. Install it with `pip install pyngrok`")
            except Exception as e:
                 print(f"Error starting ngrok: {e}")

    uvicorn.run(
        "app:app",
        host=Config.HOST,
        port=Config.PORT,
        reload=True  # Enable hot reloading
    )