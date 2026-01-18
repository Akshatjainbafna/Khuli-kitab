# Khuli Kitab (Open Book) 🏛️📖

Khuli Kitab is a high-performance RAG (Retrieval-Augmented Generation) application designed to turn your documents and Google Drive folders into a searchable, interactive knowledge base. Built with a premium, ChatGPT-like interface, it features smart deduplication, persistent chat history, and session-aware rate limiting.

---

## 🚀 Key Features

- **Multi-Source Ingestion**: Support for local PDFs, Word (.docx), and TXT files, plus direct integration with **Google Drive** (folders and individual files).
- **Smart Deduplication**: content-hashing logic that ensures unchanged documents aren't re-processed, saving API costs and database space.
- **Persistent Chat History**: Conversations are stored in **MongoDB Atlas**, allowing users to resume chats across sessions.
- **Advanced RAG Architecture**: Powered by **Google Gemini 1.5 Flash** and Gemini Embeddings for fast, accurate, and context-aware responses.
- **Session-Aware Rate Limiting**: Security layer limiting users to 25 queries per hour per session.
- **Premium UI/UX**: Responsive Next.js frontend with Shadcn UI, including dark mode, markdown support, and mobile optimization.

---

## 🛠️ Technology Stack

### Backend

- **Framework**: FastAPI (Asynchronous Python)
- **Orchestration**: LangChain
- **Vector Database**: ChromaDB (with persistent storage)
- **LLM & Embeddings**: Google Gemini API (`gemini-1.5-flash` & `text-embedding-004`)
- **Database**: MongoDB Atlas (History Persistence)
- **Document Processing**: PyPDF, docx2txt

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS & Vanilla CSS
- **Components**: Shadcn UI & Radix UI
- **Icons**: Lucide React
- **Markdown**: React-Markdown with GFM

---

## 🏗️ RAG Implementation Details

The Khuli Kitab RAG pipeline follows a structured flow:

1.  **Ingestion & Hashing**: Documents are loaded and split into chunks. Each chunk is assigned a unique ID based on `Source:Page:ChunkIndex` and an MD5 hash of its content.
2.  **Smart Upsert**: Before embedding, the system checks ChromaDB.
    - If ID + Hash match: Skip.
    - If ID matches but Hash differs: Update (Delete old + Add new).
    - If New ID: Add.
3.  **Retrieval**: Uses semantic search to find the most relevant context for a user query.
4.  **Generation**: The context is passed to Gemini with a custom system prompt that enforces professional behavior and uses the "Akshat" persona.

---

## 📋 API Endpoints

### Ingestion Endpoints

- `POST /ingest/file`: Upload a local file (`.pdf`, `.docx`, `.txt`).
- `POST /ingest/google-drive`: Ingest an entire Google Drive folder via folder ID.
- `POST /ingest/google-drive/file`: Ingest a single Google Drive file via file ID.

### Query & History Endpoints

- `POST /query`: Semantic search query. Automatically saves to history and enforces rate limits.
- `GET /chat/history/{session_id}`: Fetch previous messages for a session.
- `DELETE /chat/history/{session_id}`: Clear message history for a session.

### Maintenance Endpoints

- `GET /health`: System health check.
- `POST /database/clean`: Resets the ChromaDB vector store.

---

## ⚙️ Setup Instructions

### 1. Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB Atlas account
- Google Cloud Project (for Gemini & Drive API)

### 2. Environment Variables

#### Backend (`/backend/.env`)

| Variable          | Description             | Where to get it                                                |
| :---------------- | :---------------------- | :------------------------------------------------------------- |
| `GOOGLE_API_KEY`  | Gemini API Key          | [Google AI Studio](https://aistudio.google.com/app/apikey)     |
| `MONGODB_URI`     | Mongo Connection String | [MongoDB Atlas Dashboard](https://www.mongodb.com/cloud/atlas) |
| `MONGODB_DB_NAME` | Database name           | Optional (Defaults to `khuli_kitab`)                           |

#### Frontend (`/frontend/.env`)

| Variable                  | Description | Value                   |
| :------------------------ | :---------- | :---------------------- |
| `NEXT_PUBLIC_API_URL`     | Backend URL | `http://localhost:5000` |
| `NEXT_PUBLIC_ENVIRONMENT` | UI Mode     | `dev` or `prod`         |

### 3. Google Drive Setup

1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Enable the **Google Drive API**.
3.  Create a **Service Account** and download the `credentials.json` file.
4.  Place `credentials.json` in the `/backend/` directory.
5.  Share your Google Drive folders with the Service Account email.

### 4. Running the Application

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🛡️ Rate Limiting & Auto-Response

The system allows **25 requests per hour** per unique browser session. When the limit is reached, it automatically responds with:

> _"You have exceeded the rate limit. Please provide your email id, linkedin profile or any other contact..."_

---

## 📝 License

Created by **Akshat Jain**. Feel free to get in touch on [LinkedIn](https://www.linkedin.com/in/akshat-jain-571435139/) or via [Email](mailto:akshatbjain.aj@gmail.com).
