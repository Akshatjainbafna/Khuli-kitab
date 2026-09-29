'use client'
import { useState } from 'react'
import { AI_ITEMS, AI_TIERS, type AiTier } from '@/data/profile'
import { cn } from '@/lib/utils'
import { ACCENT, SERIES } from './palette'
import { Chip } from './ui'

const TIER_STYLE: Record<AiTier, { color: string; marker: string }> = {
  shipped: { color: ACCENT, marker: '●' },
  built: { color: SERIES[1], marker: '◐' },
  learning: { color: SERIES[2], marker: '○' },
}

const TIERS = Object.keys(AI_TIERS) as AiTier[]

export function AiTiers({ compact }: { compact?: boolean }) {
  const [filter, setFilter] = useState<AiTier | 'all'>('all')
  const [open, setOpen] = useState<string | null>(null)
  const visible = filter === 'all' ? TIERS : [filter]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tier">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
          All
        </Chip>
        {TIERS.map(t => (
          <Chip key={t} active={filter === t} onClick={() => setFilter(t)}>
            <span style={{ color: TIER_STYLE[t].color }} aria-hidden>
              {TIER_STYLE[t].marker}
            </span>{' '}
            {AI_TIERS[t].label}
          </Chip>
        ))}
      </div>

      <div className={cn('grid gap-3', visible.length > 1 && !compact && 'lg:grid-cols-3', visible.length > 1 && compact && 'sm:grid-cols-3')}>
        {visible.map(t => {
          const items = AI_ITEMS.filter(i => i.tier === t)
          return (
            <section
              key={t}
              aria-labelledby={`tier-${t}`}
              className="flex flex-col gap-2 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-1)] p-4"
              style={{ borderTopColor: TIER_STYLE[t].color, borderTopWidth: 2 }}
            >
              <header className="mb-1">
                <h4 id={`tier-${t}`} className="flex items-center justify-between text-sm font-medium text-white">
                  {AI_TIERS[t].label}
                  <span className="tabular-nums text-zinc-500">{items.length}</span>
                </h4>
                <p className="text-xs text-zinc-500">{AI_TIERS[t].hint}</p>
              </header>
              {items.map(item => (
                <button
                  key={item.name}
                  type="button"
                  aria-expanded={open === item.name}
                  onClick={() => setOpen(open === item.name ? null : item.name)}
                  className={cn(
                    'cursor-pointer rounded-xl px-3 py-2 text-left transition-colors duration-200',
                    'focus-visible:outline-2 focus-visible:outline-[var(--accent-green)]',
                    open === item.name ? 'bg-[var(--surface-2)]' : 'hover:bg-[var(--surface-2)]'
                  )}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-sm text-zinc-100">{item.name}</span>
                    <span className="shrink-0 text-[11px] uppercase tracking-wider text-zinc-500">{item.area}</span>
                  </span>
                  {open === item.name && <span className="mt-1 block text-xs leading-relaxed text-zinc-400">{item.where}</span>}
                </button>
              ))}
            </section>
          )
        })}
      </div>
    </div>
  )
}
