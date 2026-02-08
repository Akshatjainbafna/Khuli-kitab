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

# Memory chain now uses _retrieve_memory which takes the whole input dict
from langchain_core.runnables import RunnableLambda


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

Episodic Memory (Past Conversations):
{episodic_memory}

Context (Documents):
{context}
"""
    
    def __init__(
        self,
        vector_store_manager: VectorStoreManager,
        memory_vector_store: Optional[VectorStoreManager] = None,
        model_name: str = "gemini-1.5-flash",
        temperature: float = 0.0,
        google_api_key: Optional[str] = None,
        system_prompt: Optional[str] = None,
        retriever_kwargs: Optional[dict] = None
    ):
        """
        Initialize the RAG chain.
        
        Args:
            vector_store_manager: Vector store manager instance for documents
            memory_vector_store: Vector store manager instance for episodic memory
            model_name: Google model to use
            temperature: LLM temperature setting
            google_api_key: Google API key
            system_prompt: Custom system prompt
            retriever_kwargs: Configuration for the retriever
        """
        self.vector_store_manager = vector_store_manager
        self.memory_vector_store = memory_vector_store
        self.model_name = model_name
        self.temperature = temperature
        self.system_prompt = system_prompt or self.DEFAULT_SYSTEM_PROMPT
        
        # Initialize LLM
        self.llm = ChatGoogleGenerativeAI(
            model=model_name,
            temperature=temperature,
            google_api_key=google_api_key
        )
        
        # Get retriever for documents
        retriever_kwargs = retriever_kwargs or {"k": 4}
        self.retriever = vector_store_manager.as_retriever(
            search_kwargs=retriever_kwargs
        )
        
        # Get retriever for memory if available
        self.memory_retriever = None
        if memory_vector_store:
            # Maybe retrieve fewer chunks for memory, e.g., k=4
            self.memory_retriever = memory_vector_store.as_retriever(
                search_kwargs={"k": 4}
            )
        
        # Build the chain
        self._chain = self._build_chain()
    
    def _format_docs(self, docs: List[Document]) -> str:
        """Format retrieved documents into a string and print for debugging."""
        print(f"\n{'='*20} RETRIEVED CONTEXT {'='*20}")
        print(f"Found {len(docs)} relevant document chunks:")
        for i, doc in enumerate(docs):
            source = doc.metadata.get('source', 'unknown')
            page = doc.metadata.get('page', 'N/A')
            print(f"\n[Chunk {i+1}] Source: {source} (Page: {page})")
            print(f"Content: {doc.page_content[:400]}...")
            if len(doc.page_content) > 400:
                print("... (truncated in logs)")
        print(f"\n{'='*59}\n")
        return "\n\n".join(doc.page_content for doc in docs)

    def _format_memory(self, docs: List[Document]) -> str:
        """Format retrieved memory into a string."""
        if not docs:
            return "No relevant past memories found."
            
        print(f"\n{'='*20} RETRIEVED MEMORY {'='*20}")
        print(f"Found {len(docs)} relevant memory chunks:")
        formatted_memories = []
        for i, doc in enumerate(docs):
            # doc.page_content should be "role: content"
            print(f"[Memory {i+1}] {doc.page_content[:200]}...")
            formatted_memories.append(doc.page_content)
        print(f"\n{'='*59}\n")
        return "\n".join(formatted_memories)
    
    def _retrieve_memory(self, inputs: Dict[str, Any]) -> List[Document]:
        """Retrieve memory with dynamic filtering."""
        if not self.memory_vector_store:
            return []
            
        question = inputs["question"]
        session_id = inputs.get("session_id")
        
        # Filter by session_id and role="user"
        # ChromaDB requires $and for multiple conditions
        conditions = [{"role": "user"}]
        
        if session_id:
            conditions.append({"session_id": session_id})
            
        if len(conditions) > 1:
            filter_dict = {"$and": conditions}
        else:
            filter_dict = conditions[0]
            
        return self.memory_vector_store.similarity_search(
            query=question,
            k=4,
            filter=filter_dict
        )

    def _build_chain(self):
        """Build the RAG chain."""
        # Create prompt template
        prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
            ("human", "Here is the recent conversation history:\n{chat_history}"),
            ("human", "{question}")
        ])
        
        # Define chains that extract 'question' from the input dictionary
        retriever_chain = (
            (lambda x: x["question"]) | self.retriever | self._format_docs
        )

        memory_chain = (
            RunnableLambda(self._retrieve_memory) | self._format_memory
        )

        chain = (
            RunnableParallel(
                context=retriever_chain,
                episodic_memory=memory_chain,
                chat_history=lambda x: x.get("chat_history", "No history"),
                question=lambda x: x["question"]
            )
            | prompt
            | self.llm
            | StrOutputParser()
        )
        
        return chain
    
    def query(self, question: str, chat_history: List[Dict[str, Any]] = [], session_id: Optional[str] = None) -> str:
        """
        Query the RAG chain with a question and history.
        """
        # Format chat history to string
        history_str = ""
        for msg in chat_history:
            role = msg.get("role", "unknown")
            content = msg.get("content", "")
            history_str += f"{role}: {content}\n"
            
        if not history_str:
            history_str = "No recent history."

        print(f"Chat history: {history_str}")
        # creating the input dictionary for the chain
        inputs = {
            "question": question,
            "chat_history": history_str,
            "session_id": session_id
        }
        
        return self._chain.invoke(inputs)
    
    def query_with_sources(self, question: str, chat_history: List[Dict[str, Any]] = [], session_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Query with sources - returns answer and source documents.
        """
        # Format chat history
        history_str = ""
        for msg in chat_history:
            role = msg.get("role", "unknown")
            content = msg.get("content", "")
            history_str += f"{role}: {content}\n"
        if not history_str:
            history_str = "No recent history."

        inputs = {
            "question": question,
            "chat_history": history_str,
            "session_id": session_id
        }

        # Get relevant documents (Need to invoke retriever directly with question)
        docs = self.retriever.invoke(question)
        
        # Get answer (Invoke chain with inputs)
        answer = self._chain.invoke(inputs)
        
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
