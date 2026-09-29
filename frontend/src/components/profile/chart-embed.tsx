'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getChart, type ChartId } from '@/data/profile'

// Recharts is only downloaded once a chart actually appears in the chat
const ProfileChart = dynamic(() => import('./profile-chart'), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-2xl bg-[var(--surface-1)]" aria-label="Loading chart" />,
})

// A chart rendered inside an assistant message. `canned` adds the curated intro and
// takeaway (chip-triggered answers); LLM answers bring their own text around the chart.
export function ChartEmbed({ id, canned }: { id: ChartId; canned?: boolean }) {
  const meta = getChart(id)
  if (!meta) return null

  return (
    <figure className="flex w-full flex-col gap-4">
      {canned && <p>{meta.intro}</p>}
      <div className="rounded-3xl border border-[var(--hairline)] bg-[#111] p-4 sm:p-6">
        <figcaption className="mb-4 flex items-baseline justify-between gap-3">
          <span className="flex items-baseline gap-3">
            <span className="chapter-num text-lg text-[var(--accent-green)]">{meta.chapter}</span>
            <span className="font-display text-2xl text-white">{meta.title}</span>
          </span>
          <Link
            href={`/about#${meta.id}`}
            className="flex min-h-9 shrink-0 items-center gap-1 text-xs text-zinc-400 hover:text-white focus-visible:outline-2 focus-visible:outline-[var(--accent-green)]"
          >
            Full profile <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </figcaption>
        <p className="sr-only">{meta.summary}</p>
        <ProfileChart id={id} compact />
      </div>
      {canned && <p className="text-zinc-300">{meta.takeaway}</p>}
    </figure>
  )
}
