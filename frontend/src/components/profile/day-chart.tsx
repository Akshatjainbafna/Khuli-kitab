'use client'
import { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { DAY } from '@/data/profile'
import { cn } from '@/lib/utils'
import { SERIES } from './palette'
import { Segmented } from './ui'

type Mode = 'regular' | 'release'

const COLORS = SERIES

export function DayChart({ compact }: { compact?: boolean }) {
  const [mode, setMode] = useState<Mode>('regular')
  const [active, setActive] = useState<number | null>(null)

  const data = DAY.map((d, i) => ({ ...d, hours: d[mode], color: COLORS[i] })).filter(d => d.hours > 0)
  const total = data.reduce((sum, d) => sum + d.hours, 0)
  const focused = active !== null ? data[active] : null

  return (
    <div className="flex flex-col gap-6">
      <Segmented
        label="Type of day"
        value={mode}
        onChange={v => {
          setMode(v)
          setActive(null)
        }}
        options={[
          { value: 'regular', label: 'Regular day' },
          { value: 'release', label: 'Release day' },
        ]}
      />

      <div className={cn('grid items-center gap-6', compact ? 'sm:grid-cols-[220px_1fr]' : 'md:grid-cols-[300px_1fr]')}>
        <div className={cn('relative mx-auto w-full', compact ? 'h-[220px] max-w-[220px]' : 'h-[300px] max-w-[300px]')}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="hours"
                nameKey="label"
                innerRadius="64%"
                outerRadius="100%"
                paddingAngle={2}
                stroke="none"
                isAnimationActive={false}
                onMouseEnter={(_, i) => setActive(i)}
                onMouseLeave={() => setActive(null)}
              >
                {data.map((d, i) => (
                  <Cell
                    key={d.key}
                    fill={d.color}
                    fillOpacity={active === null || active === i ? 1 : 0.25}
                    className="cursor-pointer transition-[fill-opacity] duration-200"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Centre label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-display text-5xl leading-none text-white tabular-nums">
              {focused ? focused.hours : total}
              <span className="text-2xl text-zinc-500">h</span>
            </span>
            <span className="mt-1 max-w-[60%] text-xs text-zinc-400">
              {focused ? focused.label : mode === 'regular' ? 'a regular day' : 'a release day'}
            </span>
          </div>
        </div>

        {/* Legend doubles as the keyboard-accessible way to explore slices */}
        <ul className="flex flex-col gap-1" aria-label="Breakdown">
          {data.map((d, i) => (
            <li key={d.key}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                onClick={() => setActive(active === i ? null : i)}
                aria-expanded={active === i}
                className={cn(
                  'w-full cursor-pointer rounded-xl px-3 py-2 text-left transition-colors duration-200',
                  'focus-visible:outline-2 focus-visible:outline-[var(--accent-green)]',
                  active === i ? 'bg-[var(--surface-2)]' : 'hover:bg-[var(--surface-1)]'
                )}
              >
                <span className="flex items-center gap-3 text-sm">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: d.color }} aria-hidden />
                  <span className="flex-1 text-zinc-200">{d.label}</span>
                  <span className="tabular-nums text-zinc-400">
                    {d.hours}h · {Math.round((d.hours / total) * 100)}%
                  </span>
                </span>
                {active === i && <span className="mt-1 block pl-5.5 text-xs leading-relaxed text-zinc-400">{d.detail}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
