'use client'

import { useState, useRef } from 'react'
import { SendHorizonal, Plus, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { FileUp, FolderUp, Trash2, Globe } from 'lucide-react'

interface ChatBarProps {
  onSendMessage: (message: string) => void
  onClearHistory: () => void
  sessionId: string
  isInitial?: boolean
}

export function ChatBar({ onSendMessage, onClearHistory, sessionId, isInitial }: ChatBarProps) {
  const [input, setInput] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogValue, setDialogValue] = useState('')
  const [dialogType, setDialogType] = useState<'file' | 'folder' | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input)
      setInput('')
    }
  }

  const handleClearDatabase = async () => {
    try {
      const { cleanDatabase } = await import('../lib/api')
      await cleanDatabase()
      alert('Database cleared successfully!')
    } catch (error) {
      alert('Failed to clear database.')
    }
  }

  const handleIngestDriveFile = async () => {
    setDialogType('file')
    setDialogValue('')
    setIsDialogOpen(true)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const { uploadFile } = await import('../lib/api')
      await uploadFile(file, sessionId)
      alert('File uploaded and ingestion started successfully!')
    } catch (error: any) {
      alert(`Failed to upload file: ${error.message}`)
    } finally {
      // Reset input so the same file can be uploaded again if needed
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleIngestGoogleDocument = async () => {
    setDialogType('folder')
    setDialogValue('')
    setIsDialogOpen(true)
  }

  const handleDialogSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dialogValue.trim() || !dialogType) return

    setIsDialogOpen(false)
    try {
      const { ingestDriveFile, ingestGoogleDocument } = await import('../lib/api')
      if (dialogType === 'file') {
        await ingestDriveFile(dialogValue, sessionId)
        alert('File ingestion started successfully!')
      } else {
        await ingestGoogleDocument(dialogValue, sessionId)
        alert('Folder ingestion started successfully!')
      }
    } catch (error: any) {
      console.error('Ingestion error:', error)

      // Handle FastAPI/Pydantic validation errors
      if (error.detail && Array.isArray(error.detail)) {
        const firstError = error.detail[0]
        alert(
          `Failed to ingest: ${firstError.msg} (${firstError.loc?.join('.') || 'unknown location'})`
        )
      } else if (typeof error.detail === 'string') {
        alert(`Failed to ingest: ${error.detail}`)
      } else {
        alert(`Failed to ingest: ${error.message || 'An unexpected error occurred'}`)
      }
    }
  }

  return (
    <div
      className={cn(
        'w-full max-w-5xl transition-all duration-500 ease-in-out px-4',
        isInitial ? 'mb-20' : 'pb-8'
      )}
    >
      <form
        onSubmit={handleSubmit}
        className="glass-effect relative flex items-center gap-2 rounded-[2rem] sm:rounded-[2.5rem] p-1.5 sm:p-2 transition-shadow shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/5"
      >
        {process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-[1.5rem] sm:rounded-[1.75rem] transition-colors hover:bg-white/10 shrink-0"
              >
                <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-zinc-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-56 bg-zinc-900/95 border-white/10 text-zinc-100 backdrop-blur-xl rounded-2xl p-2 z-50"
            >
              <DropdownMenuItem
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-xl focus:bg-white/10 cursor-pointer px-2 py-2"
              >
                <FileUp size={16} />
                <span>Upload File</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleIngestDriveFile}
                className="flex items-center gap-2 rounded-xl focus:bg-white/10 cursor-pointer px-2 py-2"
              >
                <FolderUp size={16} />
                <span>Ingest Google Document</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleIngestGoogleDocument}
                className="flex items-center gap-2 rounded-xl focus:bg-white/10 cursor-pointer px-2 py-2"
              >
                <FolderUp size={16} />
                <span>Ingest Drive Folder</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem
                onClick={handleClearDatabase}
                className="flex items-center gap-2 rounded-xl focus:bg-red-500/10 text-red-400 focus:text-red-400 cursor-pointer px-2 py-2"
              >
                <Trash2 size={16} />
                <span>Clear Database</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onClearHistory}
                className="flex items-center gap-2 rounded-xl focus:bg-red-500/10 text-red-400 focus:text-red-400 cursor-pointer px-2 py-2"
              >
                <Trash2 size={16} />
                <span>Clear Chat History</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {process.env.NEXT_PUBLIC_ENVIRONMENT === 'prodForAkshat' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-[1.5rem] sm:rounded-[1.75rem] transition-colors hover:bg-white/10 shrink-0"
              >
                <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-zinc-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-56 bg-zinc-900/95 border-white/10 text-zinc-100 backdrop-blur-xl rounded-2xl p-2 z-50"
            >
              <DropdownMenuItem
                onClick={onClearHistory}
                className="flex items-center gap-2 rounded-xl focus:bg-red-500/10 text-red-400 focus:text-red-400 cursor-pointer px-2 py-2"
              >
                <Trash2 size={16} />
                <span>Clear Chat History</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {process.env.NEXT_PUBLIC_ENVIRONMENT === 'prod' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-[1.5rem] sm:rounded-[1.75rem] transition-colors hover:bg-white/10 shrink-0"
              >
                <Download className="h-6 w-6 sm:h-8 sm:w-8 text-zinc-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-56 bg-zinc-900/95 border-white/10 text-zinc-100 backdrop-blur-xl rounded-2xl p-2 z-50"
            >
              <DropdownMenuItem
                onClick={() => window.open('/Akshat Resume Jan 26 with Picture.pdf', '_blank')}
                className="flex items-center gap-2 rounded-xl cursor-pointer px-2 py-2"
              >
                <Download size={16} />
                <span>Download Resume</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask Khuli-kitab anything..."
          className="h-10 sm:h-12 w-1/2 flex-1 border-0 bg-transparent text-lg sm:text-2xl font-light text-white placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button
          type="submit"
          disabled={!input.trim()}
          className={cn(
            'h-10 w-10 sm:h-12 sm:w-12 rounded-[1.5rem] sm:rounded-[1.75rem] transition-all cursor-pointer shadow-xl shadow-[#10a37f]/20'
          )}
        >
          <SendHorizonal className="h-5 w-5 sm:h-7 sm:w-7" />
        </Button>
      </form>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx"
        className="hidden"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-zinc-100 rounded-3xl backdrop-blur-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Globe className="text-zinc-400" size={20} />
              {dialogType === 'file' ? 'Ingest Google Document' : 'Ingest Drive Folder'}
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Enter the Google Drive {dialogType === 'file' ? 'file' : 'folder'} URL or ID to start
              ingestion.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDialogSubmit} className="space-y-4 py-4">
            <Input
              placeholder="https://drive.google.com/..."
              value={dialogValue}
              onChange={e => setDialogValue(e.target.value)}
              className="bg-black/50 border-white/5 h-12 text-lg rounded-xl focus-visible:ring-1 focus-visible:ring-white/20"
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={!dialogValue.trim()}
                className="w-full h-12 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors"
              >
                Start Ingestion
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
