'use client'
import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { IMPACT, PROJECTS, PROJECT_DOMAIN_LABELS, type Project } from '@/data/profile'
import { cn } from '@/lib/utils'
import { ACCENT } from './palette'
import { Chip, Tag, TooltipCard } from './ui'

const FEATURED_TECH = ['React', 'Next.js', 'React Native', 'FastAPI', 'Node.js', 'MongoDB', 'Redis']

export function ProjectsSection({ compact }: { compact?: boolean }) {
  const [domain, setDomain] = useState<Project['domain'] | 'all'>('all')
  const [tech, setTech] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)

  const domains = useMemo(() => [...new Set(PROJECTS.map(p => p.domain))], [])
  const shown = PROJECTS.filter(
    p => (domain === 'all' || p.domain === domain) && (!tech || p.tech.some(t => t.startsWith(tech)))
  )
  const impact = IMPACT.map(m => ({
    ...m,
    name: m.label,
    speedup: `${Math.round(m.before / m.after)}x faster`,
  }))

  return (
    <div className="flex flex-col gap-8">
      {/* Before/after impact */}
      <section aria-labelledby="impact-h" className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-1)] p-5">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h4 id="impact-h" className="text-sm font-medium text-white">
            Measured impact <span className="font-normal text-zinc-500">· load time in seconds</span>
          </h4>
          <span className="flex gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-zinc-600" aria-hidden />
              Before
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-[var(--accent-green)]" aria-hidden />
              After
            </span>
          </span>
        </div>
        <div className={cn('w-full', compact ? 'h-[170px]' : 'h-[190px]')}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={impact} layout="vertical" margin={{ left: 0, right: 90, top: 4, bottom: 4 }} barGap={3}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={compact ? 120 : 170}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#d4d4d8', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <TooltipCard
                      title={payload[0].payload.project}
                      lines={[
                        `Before: ${payload[0].payload.before}s`,
                        `After: ${payload[0].payload.after}s`,
                        payload[0].payload.speedup,
                      ]}
                    />
                  ) : null
                }
              />
              <Bar dataKey="before" fill="#52525b" radius={[0, 4, 4, 0]} barSize={12} isAnimationActive={false}>
                <LabelList dataKey="before" position="right" formatter={(v: unknown) => `${v}s`} fill="#a1a1aa" fontSize={11} />
              </Bar>
              <Bar dataKey="after" fill={ACCENT} radius={[0, 4, 4, 0]} barSize={12} isAnimationActive={false}>
                <LabelList
                  dataKey="speedup"
                  position="right"
                  fill="#fff"
                  fontSize={11}
                  fontWeight={600}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by domain">
          <Chip active={domain === 'all'} onClick={() => setDomain('all')}>
            All domains
          </Chip>
          {domains.map(d => (
            <Chip key={d} active={domain === d} onClick={() => setDomain(domain === d ? 'all' : d)}>
              {PROJECT_DOMAIN_LABELS[d]}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by technology">
          {FEATURED_TECH.map(t => (
            <Chip key={t} active={tech === t} onClick={() => setTech(tech === t ? null : t)} className="text-xs">
              {t}
            </Chip>
          ))}
        </div>
      </div>

      <ul className={cn('grid gap-3', compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3')} aria-live="polite">
        {shown.map(p => (
          <li key={p.id} className="reveal">
            <article
              className={cn(
                'flex h-full flex-col gap-3 rounded-2xl border p-4 transition-colors duration-200',
                open === p.id ? 'border-white/20 bg-[var(--surface-2)]' : 'border-[var(--hairline)] bg-[var(--surface-1)]'
              )}
            >
              <header>
                <p className="flex items-center justify-between text-xs text-zinc-500">
                  <span>
                    {p.org} · {p.year}
                  </span>
                  <span>{PROJECT_DOMAIN_LABELS[p.domain]}</span>
                </p>
                <h4 className="mt-1 font-display text-2xl leading-tight text-white">{p.name}</h4>
              </header>
              <p className="text-sm leading-relaxed text-zinc-300">{p.pitch}</p>
              {p.metric && (
                <p className="w-fit rounded-md bg-[var(--accent-green)]/15 px-2 py-0.5 text-xs font-medium text-[var(--accent-green)]">
                  {p.metric}
                </p>
              )}
              {open === p.id && (
                <div className="flex flex-col gap-2 border-t border-[var(--hairline)] pt-3 text-sm">
                  <p className="text-zinc-300">
                    <span className="text-zinc-500">My role: </span>
                    {p.role}
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {p.decisions.map(d => (
                      <li key={d} className="flex gap-2 text-xs leading-relaxed text-zinc-400">
                        <span className="mt-1.5 h-px w-3 shrink-0 bg-zinc-500" aria-hidden />
                        {d}
                      </li>
                    ))}
                  </ul>
                  {p.links?.map(l => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-fit items-center gap-1 text-xs text-[var(--series-2)] underline-offset-2 hover:underline"
                    >
                      {l.label} <ExternalLink className="size-3" aria-hidden />
                    </a>
                  ))}
                </div>
              )}
              <div className="mt-auto flex flex-wrap gap-1.5">
                {p.tech.slice(0, open === p.id ? undefined : 4).map(t => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
              <button
                type="button"
                aria-expanded={open === p.id}
                onClick={() => setOpen(open === p.id ? null : p.id)}
                className="min-h-9 cursor-pointer self-start text-xs text-zinc-400 underline-offset-2 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-[var(--accent-green)]"
              >
                {open === p.id ? 'Show less' : 'Role & key decisions'}
              </button>
            </article>
          </li>
        ))}
        {shown.length === 0 && <li className="text-sm text-zinc-500">No projects match these filters.</li>}
      </ul>
    </div>
  )
}
