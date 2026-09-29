'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowUpRight, BookOpen, CalendarClock, Compass, Gauge, Rocket, Target } from 'lucide-react'
import { ChatBar } from './chat-bar'
import { ChartEmbed } from './profile/chart-embed'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { getChatHistory, clearChatHistory, queryBackend, saveChartMessage } from '@/lib/api'
import { splitChartMarkers } from '@/lib/chart-markers'
import { CHARTS, HERO_CHART_IDS, getChart, type ChartId } from '@/data/profile'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const CHIP_ICONS: Partial<Record<ChartId, React.ComponentType<{ className?: string }>>> = {
  skills: Gauge,
  day: CalendarClock,
  projects: Rocket,
  'looking-for': Target
}

const chartMarker = (id: ChartId) => '```chart:' + id + '```'

function AssistantMessage({ content }: { content: string }) {
  const segments = splitChartMarkers(content)
  // A message that is only a marker came from a chip: show the curated intro/takeaway
  const canned = segments.length === 1 && segments[0].type === 'chart'
  return (
    <div className="flex w-full flex-col gap-4">
      {segments.map((s, i) =>
        s.type === 'chart' ? (
          <ChartEmbed key={i} id={s.id} canned={canned} />
        ) : (
          <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>
            {s.text}
          </ReactMarkdown>
        )
      )}
    </div>
  )
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

    // "Ask me about this" links from /about arrive as /?ask=<question>
    const ask = new URLSearchParams(window.location.search).get('ask')

    // Load History on Mount
    const loadHistory = async () => {
      try {
        const result = await getChatHistory(storedId)
        if (result.history && result.history.length > 0) {
          setMessages(result.history)
          setIsStarted(true)
        }
      } catch (error) {
        console.error('Failed to load history:', error)
      }
      if (ask) {
        window.history.replaceState(null, '', '/')
        sendMessage(ask, storedId)
      }
    }
    loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleClearHistory = async () => {
    try {
      await clearChatHistory(sessionId)
      setMessages([])
      setIsStarted(false)
    } catch (error) {
      console.error('Failed to clear history:', error)
      alert('Failed to clear chat history. Please try again.')
    }
  }

  const sendMessage = async (text: string, sid: string) => {
    setIsStarted(true)

    const newUserMessage: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, newUserMessage])

    try {
      const result = await queryBackend(text, sid)

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

  const handleSendMessage = (text: string) => sendMessage(text, sessionId)

  // Chips answer instantly from curated content; no LLM call, no rate-limit usage
  const handleShowChart = (id: ChartId) => {
    const meta = getChart(id)
    if (!meta) return
    setIsStarted(true)
    setMessages(prev => [
      ...prev,
      { role: 'user', content: meta.question },
      { role: 'assistant', content: chartMarker(id) }
    ])
    saveChartMessage(sessionId, id).catch(error => console.error('Failed to save chart message:', error))
  }

  return (
    // h-dvh + overflow-hidden keep the page itself from scrolling; only the message list scrolls
    <main className="relative flex h-dvh w-full flex-col items-center overflow-hidden bg-[#0d0d0d]">
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

      {/* Explore: all chart topics, once the chat has started */}
      {isStarted && (
        <div className="fixed top-5 right-5 z-50 sm:right-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-zinc-900/80 px-4 text-sm text-zinc-300 backdrop-blur-xl transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-[#10a37f]"
              >
                <Compass className="size-4" aria-hidden />
                Explore
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 bg-zinc-900/95 border-white/10 text-zinc-100 backdrop-blur-xl rounded-2xl p-2 z-50"
            >
              {CHARTS.map(c => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={() => handleShowChart(c.id)}
                  className="flex items-baseline gap-3 rounded-xl focus:bg-white/10 cursor-pointer px-2 py-2"
                >
                  <span className="chapter-num text-xs text-[#10a37f]">{c.chapter}</span>
                  <span>{c.title}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem asChild className="flex items-center gap-2 rounded-xl focus:bg-white/10 cursor-pointer px-2 py-2">
                <Link href="/about">
                  <BookOpen size={16} />
                  <span>Open full profile</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Messages Area */}
      <div
        className={cn(
          // min-h-0 lets this flex child shrink below its content height so it scrolls instead of growing
          'min-h-0 flex-1 w-full overflow-y-auto pt-8 pb-40 transition-opacity duration-700',
          isStarted ? 'opacity-100' : 'opacity-0 invisible'
        )}
      >
        <div className="mx-auto max-w-4xl space-y-8 px-4 pt-12">
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
                  'rounded-2xl px-5 py-3 text-[15px] leading-relaxed markdown-content',
                  msg.role === 'user'
                    ? 'max-w-[85%] bg-[#2f2f2f] text-white text-left'
                    : 'w-full max-w-full bg-transparent text-zinc-100'
                )}
              >
                {msg.role === 'assistant' ? <AssistantMessage content={msg.content} /> : msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Center Hero vs Bottom Bar */}
      <div
        className={cn(
          'absolute z-10 bg-[#0d0d0d] inset-x-0 transition-all duration-700 ease-in-out flex flex-col items-center',
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
        {!isStarted && (
          <div className="-mt-14 mb-6 flex max-w-3xl flex-wrap justify-center gap-2 px-4 animate-in fade-in duration-700">
            {HERO_CHART_IDS.map(id => {
              const meta = getChart(id)!
              const Icon = CHIP_ICONS[id]!
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleShowChart(id)}
                  className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm text-zinc-300 transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-[#10a37f]"
                >
                  <Icon className="size-4 text-[#10a37f]" aria-hidden />
                  {meta.navLabel === 'Looking for' ? "What I'm looking for" : meta.title}
                </button>
              )
            })}
            <Link
              href="/about"
              className="flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm text-zinc-400 underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-[#10a37f]"
            >
              See my full profile
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
