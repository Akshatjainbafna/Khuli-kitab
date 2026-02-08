import asyncio
import os
import shutil
from dotenv import load_dotenv

# Load env before importing config
load_dotenv()

# Override collection name for testing
os.environ["CHROMA_MEMORY_COLLECTION_NAME"] = "test_chat_history_v1"

from config import Config
from rag.vector_store import VectorStoreManager
from rag.chat_manager import ChatManager
from rag.chain import RAGChain

async def verify_memory():
    print("1. Initializing components...")
    
    # Setup Vector Store for Memory
    memory_vs = VectorStoreManager(
        persist_directory=Config.CHROMA_PERSIST_DIRECTORY,
        collection_name=os.environ["CHROMA_MEMORY_COLLECTION_NAME"],
        embedding_model=Config.GOOGLE_EMBEDDING_MODEL,
        google_api_key=Config.GOOGLE_API_KEY
    )
    
    # Setup Chat Manager
    chat_manager = ChatManager(
        mongodb_uri=Config.MONGODB_URI,
        db_name=Config.MONGODB_DB_NAME,
        memory_vector_store=memory_vs
    )
    
    # Setup RAG Chain (Dummy doc store)
    doc_vs = VectorStoreManager(
        persist_directory=Config.CHROMA_PERSIST_DIRECTORY,
        collection_name="test_documents_v1", # Dummy
        embedding_model=Config.GOOGLE_EMBEDDING_MODEL,
        google_api_key=Config.GOOGLE_API_KEY
    )
    
    rag_chain = RAGChain(
        vector_store_manager=doc_vs,
        memory_vector_store=memory_vs,
        model_name=Config.GOOGLE_MODEL,
        google_api_key=Config.GOOGLE_API_KEY
    )
    
    print("\n2. Simulating a conversation for formatting instruction...")
    session_id = "test_formatting_123"
    
    # 1. User Instruction
    user_msg_1 = "Please answer all my future questions in bullet points."
    print(f"User: {user_msg_1}")
    await chat_manager.save_message(session_id, "user", user_msg_1)
    
    # 2. Assistant Acknowledges
    assistant_msg_1 = "Sure, I will use bullet points."
    print(f"Assistant: {assistant_msg_1}")
    await chat_manager.save_message(session_id, "assistant", assistant_msg_1)

    print("\n3. Testing Retrieval with Formatting Instruction...")
    query = "What is my name? (Say 'I don't know' but format it as requested)"
    # NOTE: The system prompt pretends to be Akshat, so it might make up a name if not found.
    # But we are testing the FORMAT here.
    
    print(f"User Query: {query}")
    
    # Fetch history manually as app.py would
    history = await chat_manager.get_history(session_id, limit=5)
    
    # Run Chain with history
    response = rag_chain.query(query, chat_history=history)
    print(f"\nAssistant Response:\n{response}")
    
    # Verify Bullet Points
    if "-" in response or "*" in response:
        print("\nSUCCESS: Response contains bullet points!")
    else:
        print("\nFAILURE: Response does not seem to follow bullet point format.")
        
    print("\n4. Testing Deletion...")
    await chat_manager.clear_history(session_id)
    print(f"Cleared history for session {session_id}")
    
    # Verify Deletion
    history_after = await chat_manager.get_history(session_id)
    if not history_after:
        print("SUCCESS: MongoDB history cleared.")
    else:
        print("FAILURE: MongoDB history NOT cleared.")
        
    # Verify Vector Deletion (search should return nothing or irrelevant)
    print("Searching memory for 'bullet points' instruction...")
    results = memory_vs.similarity_search("bullet points", k=2, filter={"session_id": session_id})
    if not results:
        print("SUCCESS: Vector memory cleared (No results found).")
    else:
        print(f"FAILURE: Vector memory NOT cleared. Found: {results}")

    print("\n5. Testing Session Isolation...")
    # Create a new session and ensure it DOES NOT retrieve memories from the previous session
    session_id_2 = "test_session_isolated"
    query_2 = "What is my name?"
    
    print(f"Session 2 Query: {query_2}")
    
    # Run Chain for Session 2
    # It should NOT know the name 'Akshat' or the bullet point instruction from session_id
    response_2 = rag_chain.query(query_2, session_id=session_id_2)
    print(f"\nSession 2 Response:\n{response_2}")
    
    if "Akshat" not in response_2 and "-" not in response_2:
        print("\nSUCCESS: Session isolation verified (No leakage from Session 1).")
    else:
        print("\nFAILURE: Session 2 retrieved memories from Session 1!")

    print("\n6. Cleanup...")
    # Clean up test collections
    memory_vs.delete_collection()
    doc_vs.delete_collection()
    print("Test collections deleted.")

if __name__ == "__main__":
    asyncio.run(verify_memory())
