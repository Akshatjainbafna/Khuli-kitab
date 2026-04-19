from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import uuid
from langchain_core.documents import Document

class ChatManager:
    """Manages chat history persistence in MongoDB Atlas and Vector Store (Episodic Memory)."""
    
    def __init__(self, mongodb_uri: str, db_name: str, memory_vector_store: Optional[Any] = None):
        self.client = AsyncIOMotorClient(mongodb_uri)
        self.db = self.client[db_name]
        self.chats = self.db.chats
        self.memory_vector_store = memory_vector_store

    async def save_message(self, session_id: str, role: str, content: str, save_to_vector_store: bool = True):
        """Save a single message to the chat history and memory vector store."""
        # 1. Save to MongoDB (Short-term / Log)
        message = {
            "session_id": session_id,
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow()
        }
        await self.chats.insert_one(message)
        
        # 2. Save to Vector Store (Episodic Memory)
        # We only strictly need to save USER messages for retrieval contexts, 
        # but saving assistant messages helps provide "conversation flow" context.
        # For simple episodic memory, we might just index everything.
        # if you don't want to save assistant responses in vector DB, set save_to_vector_store to False
        if self.memory_vector_store and save_to_vector_store:
            try:
                # Create a document for the message
                doc = Document(
                    page_content=f"{role}: {content}",
                    metadata={
                        "session_id": session_id,
                        "role": role,
                        "timestamp": datetime.utcnow().isoformat(),
                        "type": "chat_history"
                    }
                )
                # Add to vector store (synchronous call)
                self.memory_vector_store.add_documents([doc])
            except Exception as e:
                print(f"Error saving to episodic memory: {e}")

    async def get_history(self, session_id: str, limit: int = 50, order: str = "asc", role: str = None) -> List[Dict[str, Any]]:
        """Retrieve chat history for a session, ordered by timestamp."""
        if role:
            cursor = self.chats.find({"session_id": session_id, "role": role}).sort("timestamp", 1 if order == "asc" else -1).limit(limit)
        else:
            cursor = self.chats.find({"session_id": session_id}).sort("timestamp", 1 if order == "asc" else -1).limit(limit)
        history = []
        async for doc in cursor:
            history.append({
                "role": doc["role"],
                "content": doc["content"],
                "timestamp": doc["timestamp"].isoformat() if isinstance(doc["timestamp"], datetime) else doc["timestamp"]
            })
        return history

    async def clear_history(self, session_id: str):
        """Clear all messages for a session (MongoDB and Vector Store)."""
        # Clear Mongo
        await self.chats.delete_many({"session_id": session_id})
        
        # Clear Vector Memory
        if self.memory_vector_store:
            try:
                # We saved metadata with "session_id": session_id
                self.memory_vector_store.delete_documents(filter={"session_id": session_id})
            except Exception as e:
                print(f"Error clearing episodic memory for session {session_id}: {e}")

    async def check_rate_limit(self, session_id: str, limit: int = 25, window_hours: int = 1) -> bool:
        """
        Check if the session has exceeded the rate limit.
        Returns True if allowed, False if limited.
        """
        cutoff = datetime.utcnow() - timedelta(hours=window_hours)
        count = await self.chats.count_documents({
            "session_id": session_id,
            "role": "user",
            "timestamp": {"$gte": cutoff}
        })
        return count < limit

    async def search_chat_with_followup(self, query: str, limit: int = 50, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Find user messages matching the query phrase and their immediate successors.
        Returns a flat list of interleaved messages.
        """
        # Build filter
        query_filter: Dict[str, Any] = {
            "role": "user",
            "content": {"$regex": query, "$options": "i"}
        }
        if session_id:
            query_filter["session_id"] = session_id

        # Find matching user messages
        cursor = self.chats.find(query_filter).sort("timestamp", 1).limit(limit)
        
        history = []
        async for doc in cursor:
            # Add the matching user message
            history.append({
                "role": doc["role"],
                "content": doc["content"],
                "timestamp": doc["timestamp"].isoformat() if isinstance(doc["timestamp"], datetime) else doc["timestamp"]
            })
            
            # Find the immediate next message in the same session
            next_doc = await self.chats.find_one(
                {
                    "session_id": doc["session_id"],
                    "timestamp": {"$gt": doc["timestamp"]}
                },
                sort=[("timestamp", 1)]
            )
            
            if next_doc:
                history.append({
                    "role": next_doc["role"],
                    "content": next_doc["content"],
                    "timestamp": next_doc["timestamp"].isoformat() if isinstance(next_doc["timestamp"], datetime) else next_doc["timestamp"]
                })
                
        return history
