"""
Document Processor Module

Handles loading documents from various sources and splitting them into chunks
for embedding and storage in the vector database.
"""
import os
import hashlib
from typing import List, Optional
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    DirectoryLoader,
    Docx2txtLoader
)


class DocumentProcessor:
    """
    Processes documents by loading and splitting them into chunks.
    
    Supports multiple file formats: PDF, TXT, DOCX, MD
    """
    
    LOADER_MAPPING = {
        ".pdf": PyPDFLoader,
        ".txt": TextLoader,
        ".md": TextLoader,
        ".docx": Docx2txtLoader,
    }
    
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """
        Initialize the document processor.
        
        Args:
            chunk_size: Maximum size of each text chunk
            chunk_overlap: Overlap between consecutive chunks
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
    
    def load_document(self, file_path: str) -> List[Document]:
        """
        Load a single document from a file path.
        
        Args:
            file_path: Path to the document file
            
        Returns:
            List of Document objects
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext in self.LOADER_MAPPING:
            loader_class = self.LOADER_MAPPING[ext]
            loader = loader_class(file_path)
        else:
            # Fallback to TextLoader for other formats
            loader = TextLoader(file_path)
        
        return loader.load()
    
    def load_directory(
        self, 
        directory_path: str, 
        glob_pattern: str = "**/*.*"
    ) -> List[Document]:
        """
        Load all documents from a directory.
        
        Args:
            directory_path: Path to the directory
            glob_pattern: Pattern to match files
            
        Returns:
            List of Document objects
        """
        if not os.path.isdir(directory_path):
            raise NotADirectoryError(f"Directory not found: {directory_path}")
        
        documents = []
        
        for ext, loader_class in self.LOADER_MAPPING.items():
            try:
                loader = DirectoryLoader(
                    directory_path,
                    glob=f"**/*{ext}",
                    loader_cls=loader_class,
                    show_progress=True
                )
                documents.extend(loader.load())
            except Exception as e:
                print(f"Warning: Error loading {ext} files: {e}")
        
        return documents
    
    def split_documents(self, documents: List[Document]) -> List[Document]:
        """
        Split documents into smaller chunks and add metadata (id, hash).
        
        Metadata added:
        - id: SOURCE:PAGE:CHUNK_NUMBER
        - hash: MD5 hash of chunk content
        
        Args:
            documents: List of documents to split
            
        Returns:
            List of chunked Document objects with enhanced metadata
        """
        chunks = self.text_splitter.split_documents(documents)
        
        # Group chunks by source to calculate chunk number
        source_counters = {}
        
        for chunk in chunks:
            source = chunk.metadata.get("source", "unknown")
            # Some loaders use 'page' or 'page_number'
            page = chunk.metadata.get("page", chunk.metadata.get("page_number", 0))
            
            # Initialize counter for this source if needed
            if source not in source_counters:
                source_counters[source] = 0
            
            source_counters[source] += 1
            chunk_number = source_counters[source]
            
            # Create ID: SOURCE:PAGE:CHUNK_NUMBER
            # Use basename for source to keep ID shorter cleanly
            source_name = os.path.basename(str(source))
            chunk_id = f"{source_name}:{page}:{chunk_number}"
            
            # Create Hash of content
            content_hash = hashlib.md5(chunk.page_content.encode("utf-8")).hexdigest()
            
            # Update metadata
            chunk.metadata["id"] = chunk_id
            chunk.metadata["hash"] = content_hash
            
        return chunks
    
    def process_file(self, file_path: str) -> List[Document]:
        """
        Load and split a single file into chunks.
        
        Args:
            file_path: Path to the file
            
        Returns:
            List of chunked Document objects
        """
        documents = self.load_document(file_path)
        return self.split_documents(documents)
    
    def process_directory(
        self, 
        directory_path: str,
        glob_pattern: str = "**/*.*"
    ) -> List[Document]:
        """
        Load and split all documents in a directory.
        
        Args:
            directory_path: Path to the directory
            glob_pattern: Pattern to match files
            
        Returns:
            List of chunked Document objects
        """
        documents = self.load_directory(directory_path, glob_pattern)
        return self.split_documents(documents)
    
    def process_text(
        self, 
        text: str, 
        metadata: Optional[dict] = None
    ) -> List[Document]:
        """
        Process raw text into document chunks.
        
        Args:
            text: Raw text content
            metadata: Optional metadata for the document
            
        Returns:
            List of chunked Document objects
        """
        doc = Document(page_content=text, metadata=metadata or {})
        return self.split_documents([doc])
