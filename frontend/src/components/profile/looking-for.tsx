'use client'
import { Briefcase, Building2, Check, MapPin, Plus } from 'lucide-react'
import { LOOKING_FOR } from '@/data/profile'
import { cn } from '@/lib/utils'
import { ScoreBar, Tag } from './ui'

export function LookingFor({ compact }: { compact?: boolean }) {
  const L = LOOKING_FOR
  return (
    <div className="flex flex-col gap-6">
      <dl className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Briefcase, k: 'Role', v: `${L.role} · ${L.workMode}` },
          { icon: MapPin, k: 'Locations', v: `${L.locations.length} cities in India` },
          { icon: Building2, k: 'Company stage', v: L.stage },
        ].map(({ icon: Icon, k, v }) => (
          <div key={k} className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-1)] p-4">
            <dt className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500">
              <Icon className="size-3.5" aria-hidden />
              {k}
            </dt>
            <dd className="mt-1.5 text-sm text-white">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="-mt-3 flex flex-wrap gap-1.5" aria-label="Locations">
        {L.locations.map(c => (
          <Tag key={c}>{c}</Tag>
        ))}
      </div>

      <div className={cn('grid gap-6', !compact && 'md:grid-cols-[1.2fr_1fr]')}>
        <section aria-labelledby="priorities-h" className="flex flex-col gap-4">
          <h4 id="priorities-h" className="text-sm font-medium text-white">
            What matters most <span className="font-normal text-zinc-500">· weight out of 10</span>
          </h4>
          {L.priorities.map(p => (
            <ScoreBar key={p.label} label={p.label} score={p.weight} hint={p.why} />
          ))}
        </section>

        <div className="flex flex-col gap-3">
          <section className="rounded-2xl border border-[var(--accent-green)]/30 bg-[var(--accent-green)]/[0.05] p-5" aria-labelledby="must-h">
            <h4 id="must-h" className="mb-3 text-sm font-medium text-white">
              Must-haves
            </h4>
            <ul className="flex flex-col gap-2">
              {L.mustHaves.map(m => (
                <li key={m} className="flex gap-2.5 text-sm text-zinc-200">
                  <Check className="mt-0.5 size-4 shrink-0 text-[var(--accent-green)]" aria-hidden />
                  {m}
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface-1)] p-5" aria-labelledby="nice-h">
            <h4 id="nice-h" className="mb-3 text-sm font-medium text-white">
              Nice-to-haves
            </h4>
            <ul className="flex flex-col gap-2">
              {L.niceToHaves.map(m => (
                <li key={m} className="flex gap-2.5 text-sm text-zinc-300">
                  <Plus className="mt-0.5 size-4 shrink-0 text-zinc-500" aria-hidden />
                  {m}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
