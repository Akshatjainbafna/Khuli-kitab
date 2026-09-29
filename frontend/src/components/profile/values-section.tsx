'use client'
import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { GROWTH, STRENGTHS, VALUES } from '@/data/profile'
import { cn } from '@/lib/utils'

export function ValuesSection({ compact }: { compact?: boolean }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-8">
      <ol className={cn('grid gap-3', compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3')}>
        {VALUES.map((v, i) => (
          <li key={v.title}>
            <button
              type="button"
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? null : i)}
              className={cn(
                'group flex h-full w-full cursor-pointer flex-col gap-2 rounded-2xl border p-4 text-left transition-colors duration-200',
                'focus-visible:outline-2 focus-visible:outline-[var(--accent-green)]',
                open === i
                  ? 'border-[var(--accent-green)]/60 bg-[var(--accent-green)]/[0.07]'
                  : 'border-[var(--hairline)] bg-[var(--surface-1)] hover:border-white/15'
              )}
            >
              <span className="chapter-num text-sm text-zinc-500">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-display text-2xl leading-tight text-white">{v.title}</span>
              <span className="text-sm leading-relaxed text-zinc-300">{v.belief}</span>
              <span
                className={cn(
                  'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
                  open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                )}
              >
                <span className="overflow-hidden">
                  <span className="mt-1 block border-t border-[var(--hairline)] pt-2 text-xs leading-relaxed text-zinc-400">
                    <span className="text-[var(--accent-green)]">In practice: </span>
                    {v.evidence}
                  </span>
                </span>
              </span>
              {open !== i && <span className="text-xs text-zinc-500 group-hover:text-zinc-400">Show an example</span>}
            </button>
          </li>
        ))}
      </ol>

      <div className="grid gap-3 md:grid-cols-2">
        <section className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-1)] p-5" aria-labelledby="strengths-h">
          <h4 id="strengths-h" className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
            <ArrowUpRight className="size-4 text-[var(--accent-green)]" aria-hidden />
            Strengths
          </h4>
          <ul className="flex flex-col gap-2">
            {STRENGTHS.map(s => (
              <li key={s} className="flex items-center gap-2.5 text-sm text-zinc-300">
                <span className="h-px w-4 bg-[var(--accent-green)]" aria-hidden />
                {s}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-1)] p-5" aria-labelledby="growth-h">
          <h4 id="growth-h" className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
            <ArrowDownRight className="size-4 text-[var(--series-3)]" aria-hidden />
            What I&apos;m working on
          </h4>
          <ul className="flex flex-col gap-3">
            {GROWTH.map(g => (
              <li key={g.area} className="text-sm">
                <p className="text-zinc-200">{g.area}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">→ {g.action}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
