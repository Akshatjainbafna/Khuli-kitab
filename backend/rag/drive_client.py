"""
Google Drive Client Module

Handles interactions with Google Drive API:
- Authentication (Service Account or OAuth)
- Listing files in a folder
- Downloading files
"""
import os
import io
import logging
import re
from typing import List, Dict, Optional, Any
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

# Scopes required
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

class GoogleDriveClient:
    """Client for interacting with Google Drive API."""
    
    def __init__(self, credentials_path: str = "credentials.json", token_path: str = "token.json"):
        """
        Initialize Google Drive client.
        
        Args:
            credentials_path: Path to service account or client secret JSON
            token_path: Path to save/load user tokens (for OAuth)
        """
        self.credentials_path = credentials_path
        self.token_path = token_path
        self.service = None
        self._authenticate()
        
    def _authenticate(self):
        """Authenticate with Google Drive API."""
        creds = None
        
        # 1. Try generic Token file (cached credentials)
        if os.path.exists(self.token_path):
            try:
                creds = Credentials.from_authorized_user_file(self.token_path, SCOPES)
            except Exception as e:
                logging.warning(f"Failed to load token.json: {e}")

        # 2. If token is valid, we are good. If expired, refresh.
        if creds and creds.valid:
            self.service = build('drive', 'v3', credentials=creds)
            return

        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                with open(self.token_path, 'w') as token:
                    token.write(creds.to_json())
                self.service = build('drive', 'v3', credentials=creds)
                return
            except Exception as e:
                logging.warning(f"Failed to refresh token: {e}")
        
        # 3. No valid token, need to authenticate using credentials file
        if not os.path.exists(self.credentials_path):
             raise ValueError(f"Credentials file not found: {self.credentials_path}. Please place your OAuth 'client_secret.json' (renamed to credentials.json) in the backend directory.")

        try:
            # Check content type
            with open(self.credentials_path, 'r') as f:
                content = f.read()
            
            # Service Account Check
            if "type" in content and "service_account" in content:
                creds = service_account.Credentials.from_service_account_file(
                    self.credentials_path, scopes=SCOPES)
            
            # Desktop App Flow (User's snippet)
            elif "installed" in content or "web" in content:
                print("Starting Google Drive Desktop Auth Flow...")
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_path, SCOPES)
                creds = flow.run_local_server(port=0)
                
                # Save the credentials for the next run
                with open(self.token_path, 'w') as token:
                    token.write(creds.to_json())
            else:
                 raise ValueError("Unknown credentials file format. Expected Service Account or OAuth Client Secret.")
                 
        except Exception as e:
            raise ValueError(f"Authentication failed: {e}")
        
        self.service = build('drive', 'v3', credentials=creds)

    def list_files_in_folder(self, folder_id: str) -> List[Dict[str, Any]]:
        """
        List all PDF and Word files in a specific Google Drive folder.
        
        Args:
            folder_id: ID of the folder to scan
            
        Returns:
            List of file metadata dicts (id, name, mimeType)
        """
        query = f"'{folder_id}' in parents and (mimeType = 'application/pdf' or mimeType = 'application/vnd.google-apps.document') and trashed = false"
        
        results = []
        page_token = None
        
        while True:
            response = self.service.files().list(
                q=query,
                spaces='drive',
                fields='nextPageToken, files(id, name, mimeType)',
                pageToken=page_token
            ).execute()
            print(response)
            
            for file in response.get('files', []):
                results.append(file)
                
            page_token = response.get('nextPageToken', None)
            if page_token is None:
                break
                
        return results

    @staticmethod
    def extract_id_from_url(input_str: str) -> str:
        """
        Extracts Google Drive ID from a full URL or returns the ID if it matches the pattern.
        Works for folders and files.
        """
        # Patterns for files and folders
        # /d/ID/ or id=ID or folders/ID
        patterns = [
            r"/d/([a-zA-Z0-9_-]{25,})",
            r"id=([a-zA-Z0-9_-]{25,})",
            r"folders/([a-zA-Z0-9_-]{25,})",
            r"([a-zA-Z0-9_-]{25,})" # Fallback to just the ID pattern
        ]
        
        for pattern in patterns:
            match = re.search(pattern, input_str)
            if match:
                return match.group(1)
        
        return input_str # Return as is if no match (though likely invalid)

    def get_file_metadata(self, file_id: str) -> Dict[str, Any]:
        """
        Get metadata for a specific file.
        
        Args:
            file_id: ID of the file to fetch
            
        Returns:
            Dictionary containing file metadata (id, name, mimeType)
        """
        try:
            return self.service.files().get(
                fileId=file_id,
                fields='id, name, mimeType'
            ).execute()
        except Exception as e:
            raise ValueError(f"Failed to fetch metadata for file {file_id}: {e}")

    def download_file(self, file_id: str, dest_path: str, mime_type: Optional[str] = None):
        """
        Download a file from Google Drive. Exports Google Docs to DOCX.
        
        Args:
            file_id: ID of the file to download
            dest_path: Local path to save the file
            mime_type: MIME type of the file (optional, used to detect Google Docs)
        """
        try:
            if mime_type == 'application/vnd.google-apps.document':
                # Export Google Doc to DOCX
                request = self.service.files().export_media(
                    fileId=file_id,
                    mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                )
            else:
                # Standard download
                request = self.service.files().get_media(fileId=file_id)
                
            fh = io.FileIO(dest_path, 'wb')
            downloader = MediaIoBaseDownload(fh, request)
            
            done = False
            while done is False:
                status, done = downloader.next_chunk()
        except Exception as e:
            # Clean up if file was created but failed
            if os.path.exists(dest_path):
                try:
                    fh.close()
                    os.remove(dest_path)
                except:
                    pass
            raise e
