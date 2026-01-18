

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function queryBackend(text: string, sessionId: string) {
    try {
        const response = await fetch(`${API_URL}/query`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ question: text, session_id: sessionId, include_sources: false }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}
export async function cleanDatabase() {
    try {
        const response = await fetch(`${API_URL}/database/clean`, {
            method: "POST",
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("API Error (Clean DB):", error);
        throw error;
    }
}

export async function ingestDriveFile(fileIdOrUrl: string, sessionId: string) {
    try {
        const response = await fetch(`${API_URL}/ingest/google-drive/file`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ file_id: fileIdOrUrl, session_id: sessionId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error) throw error;
        throw error;
    }
}

export async function ingestGoogleDocument(fileIdOrUrl: string, sessionId: string) {
    try {
        const response = await fetch(`${API_URL}/ingest/google-drive`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ folder_id: fileIdOrUrl, session_id: sessionId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error) throw error;
        throw error;
    }
}

export async function uploadFile(file: File, sessionId: string) {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("session_id", sessionId);

        const response = await fetch(`${API_URL}/ingest/file`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error) throw error;
        throw error;
    }
}

export async function getChatHistory(sessionId: string) {
    try {
        const response = await fetch(`${API_URL}/chat/history/${sessionId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("API Error (Get History):", error);
        throw error;
    }
}

export async function clearChatHistory(sessionId: string) {
    try {
        const response = await fetch(`${API_URL}/chat/history/${sessionId}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("API Error (Clear History):", error);
        throw error;
    }
}

