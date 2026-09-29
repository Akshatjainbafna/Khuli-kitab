'use client'
import { useState } from 'react'
import { PROCESS } from '@/data/profile'
import { cn } from '@/lib/utils'
import { SERIES } from './palette'
import { Tag } from './ui'

const COLORS = [SERIES[1], SERIES[5], SERIES[3], SERIES[0], SERIES[4], SERIES[2], SERIES[6]]

export function ProcessStepper({ compact }: { compact?: boolean }) {
  const [active, setActive] = useState(0)
  const step = PROCESS[active]

  return (
    <div className="flex flex-col gap-5">
      {/* Effort distribution: one proportional bar, each segment selects a step */}
      <div>
        <p className="mb-2 text-xs text-zinc-500">Share of effort per step</p>
        <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full">
          {PROCESS.map((s, i) => (
            <button
              key={s.key}
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={() => setActive(i)}
              title={`${s.label}: ${s.effort}%`}
              className="h-full cursor-pointer transition-opacity duration-200"
              style={{ width: `${s.effort}%`, background: COLORS[i], opacity: i === active ? 1 : 0.35 }}
            />
          ))}
        </div>
      </div>

      <div role="tablist" aria-label="Process steps" className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
        {PROCESS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            id={`step-${s.key}`}
            aria-selected={i === active}
            aria-controls="step-panel"
            onClick={() => setActive(i)}
            onKeyDown={e => {
              if (e.key === 'ArrowRight') setActive((active + 1) % PROCESS.length)
              if (e.key === 'ArrowLeft') setActive((active - 1 + PROCESS.length) % PROCESS.length)
            }}
            className={cn(
              'flex min-h-14 cursor-pointer flex-col items-start justify-between rounded-xl border px-2.5 py-2 text-left transition-colors duration-200',
              'focus-visible:outline-2 focus-visible:outline-[var(--accent-green)]',
              i === active ? 'border-white/25 bg-[var(--surface-2)]' : 'border-[var(--hairline)] hover:bg-[var(--surface-1)]'
            )}
          >
            <span className="chapter-num text-xs" style={{ color: COLORS[i] }}>
              {i + 1}
            </span>
            <span className={cn('text-sm', i === active ? 'text-white' : 'text-zinc-400')}>{s.label}</span>
          </button>
        ))}
      </div>

      <div
        id="step-panel"
        role="tabpanel"
        aria-labelledby={`step-${step.key}`}
        key={step.key}
        className={cn('reveal grid gap-4 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-1)] p-5', !compact && 'md:grid-cols-[1fr_1fr]')}
      >
        <div>
          <p className="flex items-baseline gap-3">
            <span className="font-display text-3xl text-white">{step.label}</span>
            <span className="text-sm tabular-nums text-zinc-400">~{step.effort}% of effort</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">{step.what}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {step.tools.map(t => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>
        <blockquote className="self-start border-l-2 pl-4 text-sm leading-relaxed text-zinc-400" style={{ borderColor: COLORS[active] }}>
          <span className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">Real example</span>
          {step.example}
        </blockquote>
      </div>
    </div>
  )
}
