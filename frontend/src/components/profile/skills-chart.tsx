'use client'
import { useState } from 'react'
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts'
import { SKILLS, SKILL_SCALE } from '@/data/profile'
import { cn } from '@/lib/utils'
import { ACCENT, SERIES } from './palette'
import { Chip, ScoreBar } from './ui'

export function SkillsChart({ compact }: { compact?: boolean }) {
  const [selected, setSelected] = useState(0)
  const category = SKILLS[selected]
  const data = SKILLS.map(s => ({ axis: s.short, score: s.score }))

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs text-zinc-500">{SKILL_SCALE}</p>

      <div className={cn('grid items-center gap-6', compact ? 'sm:grid-cols-2' : 'md:grid-cols-[1.1fr_1fr]')}>
        <div className={cn('w-full', compact ? 'h-[240px]' : 'h-[340px]')}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="68%" margin={{ top: 8, right: 36, bottom: 8, left: 36 }}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarRadiusAxis domain={[0, 10]} tickCount={6} tick={false} axisLine={false} />
              <PolarAngleAxis
                dataKey="axis"
                tick={({ x, y, payload, textAnchor, index }) => (
                  <text
                    x={x}
                    y={y}
                    textAnchor={textAnchor}
                    dominantBaseline="central"
                    onClick={() => setSelected(index)}
                    className="cursor-pointer"
                    fill={index === selected ? '#fff' : '#a1a1aa'}
                    fontSize={12}
                    fontWeight={index === selected ? 600 : 400}
                  >
                    {payload.value} · {data[index].score}
                  </text>
                )}
              />
              <Radar
                dataKey="score"
                stroke={ACCENT}
                strokeWidth={2}
                fill={ACCENT}
                fillOpacity={0.18}
                dot={{ r: 3, fill: ACCENT, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Skill category">
            {SKILLS.map((s, i) => (
              <Chip key={s.category} active={i === selected} onClick={() => setSelected(i)}>
                {s.category}
              </Chip>
            ))}
          </div>
          <div className="flex flex-col gap-3.5 rounded-2xl border border-[var(--hairline)] bg-[var(--surface-1)] p-4" aria-live="polite">
            <p className="flex items-baseline justify-between">
              <span className="font-display text-2xl text-white">{category.category}</span>
              <span className="text-sm tabular-nums text-zinc-400">
                overall <span className="text-white">{category.score}</span>/10
              </span>
            </p>
            {category.skills.map(s => (
              <ScoreBar key={s.name} label={s.name} score={s.score} color={s.score >= 8 ? ACCENT : s.score >= 6 ? SERIES[1] : SERIES[2]} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
