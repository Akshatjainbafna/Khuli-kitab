'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, MessageSquare, Calendar, Loader2, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { searchChatHistory } from '@/lib/api'
import { cn } from '@/lib/utils'

interface SearchDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  sessionId: string
}

interface ChatMessage {
  role: string
  content: string
  timestamp: string
}

export function SearchDialog({ isOpen, onOpenChange, sessionId }: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCurrentSessionOnly, setIsCurrentSessionOnly] = useState(true)

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const data = await searchChatHistory(
        searchQuery,
        isCurrentSessionOnly ? sessionId : undefined
      )
      setResults(data.history || [])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isCurrentSessionOnly, sessionId])

  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsLoading(false)
      return
    }

    const timer = setTimeout(() => {
      handleSearch(query)
    }, 500)
    return () => clearTimeout(timer)
  }, [query, handleSearch])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col bg-zinc-950/90 border-white/10 text-zinc-100 rounded-[2rem] backdrop-blur-3xl p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
                <Search className="text-[#10a37f]" size={24} />
                Search Chat History
              </DialogTitle>
              <DialogDescription className="text-zinc-500">
                Find phrases and responses from your past conversations.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-4 space-y-4 flex-1 flex flex-col min-h-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Type a phrase to search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-white/5 border-white/5 h-12 pl-11 text-lg rounded-2xl focus-visible:ring-1 focus-visible:ring-white/20 placeholder:text-zinc-600"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              {isLoading && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 animate-spin" size={18} />
              )}
            </div>

            {process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev' && <Button
              variant="outline"
              onClick={() => setIsCurrentSessionOnly(!isCurrentSessionOnly)}
              className={cn(
                "h-12 px-4 rounded-2xl border-white/5 transition-all text-sm font-medium",
                isCurrentSessionOnly
                  ? "bg-[#10a37f]/10 text-[#10a37f] border-[#10a37f]/20 hover:bg-[#10a37f]/20"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10"
              )}
            >
              {isCurrentSessionOnly ? "Current Session" : "All Sessions"}
            </Button>}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {results.length > 0 ? (
              <div className="space-y-6 py-2">
                {results.map((msg, index) => {
                  // Only style the matches (User messages) differently? 
                  // No, we want to show pairs. Data is interleaved.
                  const isUser = msg.role === 'user'
                  return (
                    <div
                      key={index}
                      className={cn(
                        "group relative rounded-2xl p-4 transition-all border border-transparent",
                        isUser
                          ? "bg-white/5 hover:border-white/10"
                          : "bg-transparent ml-4 border-l-2 border-l-[#10a37f]/30"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold",
                          isUser ? "bg-zinc-800 text-zinc-400" : "bg-[#10a37f] text-white"
                        )}>
                          {isUser ? "U" : "K"}
                        </div>
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          {isUser ? "You" : "Khuli-Kitab"}
                        </span>
                        <span className="text-[10px] text-zinc-600 ml-auto">
                          {new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={cn(
                        "text-sm sm:text-base leading-relaxed markdown-content",
                        isUser ? "text-zinc-200" : "text-zinc-300 italic"
                      )}>
                        {!isUser ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : query.trim() && !isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-3">
                <MessageSquare size={48} className="opacity-20" />
                <p className="text-lg">No matches found for "{query}"</p>
                <p className="text-sm">Try searching across all sessions instead.</p>
              </div>
            ) : !query.trim() ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-3">
                <Search size={48} className="opacity-10" />
                <p>Enter a phrase to start searching</p>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
