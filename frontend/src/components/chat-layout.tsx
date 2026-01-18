'use client'
import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChatBar } from './chat-bar'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatLayout() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStarted, setIsStarted] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Handle Session Persistence with localStorage
    let storedId = localStorage.getItem('khuli_kitab_session_id')
    if (!storedId) {
      storedId = crypto.randomUUID()
      localStorage.setItem('khuli_kitab_session_id', storedId)
    }
    setSessionId(storedId)

    // Load History on Mount
    const loadHistory = async () => {
      try {
        const { getChatHistory } = await import('../lib/api')
        const result = await getChatHistory(storedId)
        if (result.history && result.history.length > 0) {
          setMessages(result.history)
          setIsStarted(true)
        }
      } catch (error) {
        console.error('Failed to load history:', error)
      }
    }
    loadHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleClearHistory = async () => {
    try {
      const { clearChatHistory } = await import('../lib/api')
      await clearChatHistory(sessionId)
      setMessages([])
      setIsStarted(false)
    } catch (error) {
      console.error('Failed to clear history:', error)
      alert('Failed to clear chat history. Please try again.')
    }
  }

  const handleSendMessage = async (text: string) => {
    if (!isStarted) setIsStarted(true)

    const newUserMessage: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, newUserMessage])

    try {
      const { queryBackend } = await import('../lib/api')
      const result = await queryBackend(text, sessionId)

      // Assuming backend returns { response: "..." }
      const responseContent = result.answer || 'No response from server'
      setMessages(prev => [...prev, { role: 'assistant', content: responseContent }])
    } catch (error) {
      console.error('Failed to query backend:', error)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting to the backend right now."
        }
      ])
    }
  }

  return (
    <main className="relative flex h-screen w-full flex-col items-center bg-[#0d0d0d]">
      {/* Top Left Logo */}
      <div className="fixed top-6 left-8 z-50 items-center gap-2 select-none group cursor-default">
        <div className="text-lg font-medium tracking-tight text-zinc-100 group-hover:text-white transition-colors">
          Khuli Kitab
        </div>
        <div className="text-xs font-medium tracking-tight text-zinc-100 group-hover:text-white transition-colors">
          <a
            href="https://www.linkedin.com/in/akshat-jain-571435139/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            By Akshat
          </a>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className={cn(
          'flex-1 w-full overflow-y-auto pt-8 pb-32 transition-opacity duration-700',
          isStarted ? 'opacity-100' : 'opacity-0 invisible'
        )}
      >
        <div className="mx-auto max-w-4xl space-y-8 px-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'group flex w-full flex-col gap-2 transition-all animate-in fade-in slide-in-from-bottom-2',
                msg.role === 'user' ? 'items-end text-right' : 'items-start text-left'
              )}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-5 py-3 text-[15px] leading-relaxed markdown-content',
                  msg.role === 'user'
                    ? 'bg-[#2f2f2f] text-white text-left'
                    : 'bg-transparent text-zinc-100'
                )}
              >
                {msg.role === 'assistant' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Center Hero vs Bottom Bar */}
      <div
        className={cn(
          'absolute z-10 bg-[#0d0d0d] inset-x-0 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col items-center',
          isStarted ? 'bottom-0 translate-y-0' : 'bottom-1/2 translate-y-1/2'
        )}
      >
        {!isStarted && (
          <div className="mb-8 text-center animate-in fade-in zoom-in-95 duration-500">
            <h1 className="text-4xl font-semibold text-white">Khuli-kitab</h1>
            <p className="mt-4 text-zinc-400">Know About me, through a chat based portfolio!</p>
          </div>
        )}
        <ChatBar
          onSendMessage={handleSendMessage}
          onClearHistory={handleClearHistory}
          sessionId={sessionId}
          isInitial={!isStarted}
        />
      </div>
    </main>
  )
}
