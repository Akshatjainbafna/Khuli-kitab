'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Download, MessageCircle } from 'lucide-react'
import { CHARTS, LOOKING_FOR, RESUME_PATH, type ChartId } from '@/data/profile'
import { cn } from '@/lib/utils'
import ProfileChart from './profile-chart'

export default function ProfilePage() {
  const [active, setActive] = useState<ChartId>(CHARTS[0].id)

  // Highlight the chapter currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id as ChartId)
      },
      { rootMargin: '-20% 0px -60% 0px' }
    )
    CHARTS.forEach(c => {
      const el = document.getElementById(c.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative min-h-dvh bg-[#0d0d0d] text-zinc-100">
      <div className="grain" aria-hidden />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--hairline)] bg-[#0d0d0d]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-lg font-medium tracking-tight text-zinc-100 hover:text-white">
            Khuli Kitab
          </Link>
          <div className="flex items-center gap-2">
            <a
              href={RESUME_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-10 items-center gap-2 rounded-full px-4 text-sm text-zinc-300 hover:bg-white/5 hover:text-white sm:flex"
            >
              <Download className="size-4" aria-hidden />
              Resume
            </a>
            <Link
              href="/"
              className="flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
            >
              <MessageCircle className="size-4" aria-hidden />
              Chat with me
            </Link>
          </div>
        </div>
        {/* Mobile chapter nav */}
        <nav aria-label="Chapters" className="flex gap-1 overflow-x-auto px-4 pb-3 lg:hidden">
          {CHARTS.map(c => (
            <a
              key={c.id}
              href={`#${c.id}`}
              aria-current={active === c.id ? 'location' : undefined}
              className={cn(
                'flex min-h-9 shrink-0 items-center rounded-full px-3 text-sm transition-colors',
                active === c.id ? 'bg-white/10 text-white' : 'text-zinc-400'
              )}
            >
              {c.navLabel}
            </a>
          ))}
        </nav>
      </header>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[180px_1fr]">
        {/* Desktop chapter nav */}
        <nav aria-label="Chapters" className="sticky top-28 hidden h-fit lg:block">
          <ol className="flex flex-col gap-0.5 border-l border-[var(--hairline)]">
            {CHARTS.map(c => (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  aria-current={active === c.id ? 'location' : undefined}
                  className={cn(
                    '-ml-px flex items-baseline gap-2.5 border-l py-1.5 pl-4 text-sm transition-colors duration-200',
                    active === c.id ? 'border-[var(--accent-green)] text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  <span className="chapter-num text-xs">{c.chapter}</span>
                  {c.navLabel}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <main id="main" className="min-w-0 pb-32">
          {/* Title page */}
          <section className="reveal pt-14 pb-16 sm:pt-20">
            <p className="mb-4 text-sm tracking-wide text-[var(--accent-green)]">An open book</p>
            <h1 className="font-display text-5xl leading-[1.05] text-white sm:text-7xl">
              Akshat Jain
              <span className="block text-zinc-500 italic">in eight chapters.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
              {LOOKING_FOR.role} with 4+ years building full-stack, data-heavy and AI-native products. Currently shipping transit
              ticketing at Billeasy for about 150K daily transactions. Everything below is interactive; each chapter links back to
              the chat if you want to dig deeper.
            </p>
          </section>

          <div className="flex flex-col gap-24">
            {CHARTS.map(c => (
              <section key={c.id} id={c.id} aria-labelledby={`${c.id}-title`} className="scroll-mt-36 lg:scroll-mt-24">
                <header className="mb-8 grid gap-4 border-t border-[var(--hairline)] pt-8 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <p className="chapter-num text-base text-[var(--accent-green)]">Chapter {c.chapter}</p>
                    <h2 id={`${c.id}-title`} className="mt-1 font-display text-4xl leading-tight text-white sm:text-5xl">
                      {c.title}
                    </h2>
                    <p className="mt-3 max-w-2xl leading-relaxed text-zinc-400">{c.intro}</p>
                  </div>
                  <Link
                    href={`/?ask=${encodeURIComponent(c.question)}`}
                    className="group flex min-h-10 w-fit items-center gap-2 rounded-full border border-[var(--hairline)] px-4 text-sm text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                  >
                    Ask me about this
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
                  </Link>
                </header>
                <p className="sr-only">{c.summary}</p>
                <ProfileChart id={c.id} />
                <p className="mt-6 max-w-2xl border-l-2 border-[var(--accent-green)]/50 pl-4 text-sm leading-relaxed text-zinc-400 italic">
                  {c.takeaway}
                </p>
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
