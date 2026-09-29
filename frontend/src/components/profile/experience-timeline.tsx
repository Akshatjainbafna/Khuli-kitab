'use client'
import { useState } from 'react'
import { DOMAINS, ROLES, type Role } from '@/data/profile'
import { cn } from '@/lib/utils'
import { Segmented, Tag } from './ui'

type Lens = 'roles' | 'domains'

const toMonths = (ym: string) => {
  const [y, m] = ym.split('-').map(Number)
  return y * 12 + (m - 1)
}

const nowYm = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const fmt = (ym: string | null) => {
  if (!ym) return 'Present'
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

const duration = (months: number) => {
  const y = Math.floor(months / 12)
  const m = months % 12
  return [y && `${y} yr`, m && `${m} mo`].filter(Boolean).join(' ') || '<1 mo'
}

export function ExperienceTimeline({ compact }: { compact?: boolean }) {
  const [lens, setLens] = useState<Lens>('roles')
  const [active, setActive] = useState<number>(ROLES.length - 1)

  const start = toMonths('2022-01')
  const end = toMonths(nowYm()) + 1
  const span = end - start
  const firstYear = 2022
  const years = Array.from({ length: Math.floor((end - 1) / 12) - firstYear + 1 }, (_, i) => firstYear + i)

  const spanOf = (r: Role) => {
    const s = toMonths(r.start) - start
    const e = (r.end ? toMonths(r.end) + 1 : end) - start
    return { left: (s / span) * 100, width: ((e - s) / span) * 100, months: e - s }
  }

  const role = ROLES[active]
  const domain = DOMAINS[role.domain]
  const totalMonths = ROLES.reduce((sum, r) => sum + spanOf(r).months, 0)

  return (
    <div className="flex flex-col gap-5">
      <Segmented
        label="Lens"
        value={lens}
        onChange={setLens}
        options={[
          { value: 'roles', label: 'By role' },
          { value: 'domains', label: 'By domain' },
        ]}
      />

      <div className="flex flex-col gap-2">
        {/* Year axis */}
        {/* Offsets match the row padding (px-2) plus the label column and gap so ticks line up with bars */}
        <div className="relative mx-2 h-5 sm:ml-[11.75rem]">
          {years.map(y => (
            <span
              key={y}
              className="absolute top-0 -translate-x-1/2 text-xs tabular-nums text-zinc-500 first:translate-x-0"
              style={{ left: `${((toMonths(`${y}-01`) - start) / span) * 100}%` }}
            >
              {y}
            </span>
          ))}
        </div>

        <ul className="flex flex-col gap-2">
          {ROLES.map((r, i) => {
            const { left, width, months } = spanOf(r)
            const d = DOMAINS[r.domain]
            return (
              <li key={r.company}>
                <button
                  type="button"
                  aria-pressed={i === active}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    'grid w-full cursor-pointer items-center gap-1.5 rounded-xl px-2 py-2 text-left transition-colors duration-200 sm:grid-cols-[10.5rem_1fr] sm:gap-3',
                    'focus-visible:outline-2 focus-visible:outline-[var(--accent-green)]',
                    i === active ? 'bg-[var(--surface-2)]' : 'hover:bg-[var(--surface-1)]'
                  )}
                >
                  <span className="min-w-0 text-sm">
                    <span className="block truncate text-zinc-200">{lens === 'roles' ? r.company : d.label}</span>
                    <span className="block truncate text-xs text-zinc-500">
                      {lens === 'roles' ? r.title : `${duration(months)} · ${r.company}`}
                    </span>
                  </span>
                  <span className="relative h-6 rounded-md bg-[var(--surface-1)]">
                    <span
                      className="absolute inset-y-0 rounded-md transition-opacity duration-200"
                      style={{
                        left: `${left}%`,
                        width: `max(${width}%, 6px)`,
                        background: d.color,
                        opacity: i === active ? 1 : 0.55,
                      }}
                    />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Legend (colour is never the only cue: rows are labelled too) */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-400">
        {Object.entries(DOMAINS).map(([k, d]) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: d.color }} aria-hidden />
            {d.label}
          </span>
        ))}
      </div>

      <div
        key={`${lens}-${active}`}
        aria-live="polite"
        className={cn('reveal grid gap-3 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-1)] p-5', !compact && 'md:grid-cols-[1fr_auto]')}
      >
        {lens === 'roles' ? (
          <div>
            <p className="font-display text-2xl text-white">
              {role.title} <span className="text-zinc-500">at</span> {role.company}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {fmt(role.start)} – {fmt(role.end)} · {domain.label}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">{role.achievement}</p>
          </div>
        ) : (
          <div>
            <p className="font-display text-2xl text-white">{domain.label}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {duration(spanOf(role).months)} · {Math.round((spanOf(role).months / totalMonths) * 100)}% of my career
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {domain.stack.map(t => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
