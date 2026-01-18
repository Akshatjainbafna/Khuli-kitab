from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import uuid

class ChatManager:
    """Manages chat history persistence in MongoDB Atlas."""
    
    def __init__(self, mongodb_uri: str, db_name: str):
        self.client = AsyncIOMotorClient(mongodb_uri)
        self.db = self.client[db_name]
        self.chats = self.db.chats

    async def save_message(self, session_id: str, role: str, content: str):
        """Save a single message to the chat history."""
        message = {
            "session_id": session_id,
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow()
        }
        await self.chats.insert_one(message)

    async def get_history(self, session_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve chat history for a session, ordered by timestamp."""
        cursor = self.chats.find({"session_id": session_id}).sort("timestamp", 1).limit(limit)
        history = []
        async for doc in cursor:
            history.append({
                "role": doc["role"],
                "content": doc["content"],
                "timestamp": doc["timestamp"].isoformat() if isinstance(doc["timestamp"], datetime) else doc["timestamp"]
            })
        return history

    async def clear_history(self, session_id: str):
        """Clear all messages for a session."""
        await self.chats.delete_many({"session_id": session_id})

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
