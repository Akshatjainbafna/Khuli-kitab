"""
RAG Chain Module

Orchestrates the retrieval-augmented generation pipeline using LangChain.
Combines the vector store retriever with OpenAI LLM for generating responses.
"""
from typing import Optional, Dict, Any, List
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableParallel
from langchain_core.documents import Document

from .vector_store import VectorStoreManager


class RAGChain:
    """
    RAG Chain for question-answering with retrieval.
    
    Combines document retrieval with LLM generation for contextual responses.
    """
    
    DEFAULT_SYSTEM_PROMPT = """You are a helpful assistant that answers questions based on the provided context.
Use the following pieces of retrieved context to answer the question.
If you don't know the answer based on the context, say that I can't share this information on chat please provide your email id, linkedin profile or any other contact, or get in touch with me on linkedin : https://www.linkedin.com/in/akshat-jain-571435139/ , mail : akshatbjain.aj@gmail.com , contact: +91 9425919685 so we can take this discussion ahead.
Be concise and accurate in your responses.
Don't talk in third person. Pretend like you are Akshat.
If the email, linkedin or any other contact is provided in the response, reply thanks for providing the contact, I will contact you back soon.
Context:
{context}
"""
    
    def __init__(
        self,
        vector_store_manager: VectorStoreManager,
        model_name: str = "gemini-1.5-flash",
        temperature: float = 0.0,
        google_api_key: Optional[str] = None,
        system_prompt: Optional[str] = None,
        retriever_kwargs: Optional[dict] = None
    ):
        """
        Initialize the RAG chain.
        
        Args:
            vector_store_manager: Vector store manager instance
            model_name: Google model to use
            temperature: LLM temperature setting
            google_api_key: Google API key
            system_prompt: Custom system prompt
            retriever_kwargs: Configuration for the retriever
        """
        self.vector_store_manager = vector_store_manager
        self.model_name = model_name
        self.temperature = temperature
        self.system_prompt = system_prompt or self.DEFAULT_SYSTEM_PROMPT
        
        # Initialize LLM
        self.llm = ChatGoogleGenerativeAI(
            model=model_name,
            temperature=temperature,
            google_api_key=google_api_key
        )
        
        # Get retriever
        retriever_kwargs = retriever_kwargs or {"k": 4}
        self.retriever = vector_store_manager.as_retriever(
            search_kwargs=retriever_kwargs
        )
        
        # Build the chain
        self._chain = self._build_chain()
    
    def _format_docs(self, docs: List[Document]) -> str:
        """Format retrieved documents into a string."""
        return "\n\n".join(doc.page_content for doc in docs)
    
    def _build_chain(self):
        """Build the RAG chain."""
        # Create prompt template
        prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
            ("human", "{question}")
        ])
        
        # Build the chain with context retrieval
        chain = (
            RunnableParallel(
                context=self.retriever | self._format_docs,
                question=RunnablePassthrough()
            )
            | prompt
            | self.llm
            | StrOutputParser()
        )
        
        return chain
    
    def query(self, question: str) -> str:
        """
        Query the RAG chain with a question.
        
        Args:
            question: The question to answer
            
        Returns:
            Generated answer based on retrieved context
        """
        return self._chain.invoke(question)
    
    def query_with_sources(self, question: str) -> Dict[str, Any]:
        """
        Query with sources - returns answer and source documents.
        
        Args:
            question: The question to answer
            
        Returns:
            Dictionary with 'answer' and 'sources' keys
        """
        # Get relevant documents
        docs = self.retriever.invoke(question)
        
        # Get answer
        answer = self._chain.invoke(question)
        
        # Format sources
        sources = [
            {
                "content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                "metadata": doc.metadata
            }
            for doc in docs
        ]
        
        return {
            "answer": answer,
            "sources": sources
        }
    
    async def aquery(self, question: str) -> str:
        """
        Async query the RAG chain.
        
        Args:
            question: The question to answer
            
        Returns:
            Generated answer
        """
        return await self._chain.ainvoke(question)
    
    def update_retriever(self, search_kwargs: dict) -> None:
        """
        Update retriever configuration.
        
        Args:
            search_kwargs: New search configuration
        """
        self.retriever = self.vector_store_manager.as_retriever(
            search_kwargs=search_kwargs
        )
        self._chain = self._build_chain()
