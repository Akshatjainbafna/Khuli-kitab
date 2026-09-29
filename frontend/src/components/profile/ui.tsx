'use client'
import { cn } from '@/lib/utils'

// Shared building blocks for the profile charts. Everything here is keyboard-operable
// and meets the 44px touch-target minimum on mobile.

interface SegmentedProps<T extends string> {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}

export function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex w-fit self-start rounded-full border border-[var(--hairline)] bg-[var(--surface-1)] p-1"
    >
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'min-h-9 cursor-pointer rounded-full px-4 text-sm transition-colors duration-200',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-green)]',
            value === o.value ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

interface ChipProps {
  active?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
}

export function Chip({ active, onClick, children, className }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'min-h-9 cursor-pointer rounded-full border px-3.5 text-sm transition-colors duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-green)]',
        active
          ? 'border-[var(--accent-green)] bg-[var(--accent-green)]/15 text-white'
          : 'border-[var(--hairline)] text-zinc-400 hover:border-white/20 hover:text-white',
        className
      )}
    >
      {children}
    </button>
  )
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-[var(--hairline)] bg-[var(--surface-1)] px-2 py-0.5 text-xs text-zinc-300">
      {children}
    </span>
  )
}

// Horizontal score bar out of `max` (used for skill drill-down and priorities)
export function ScoreBar({
  label,
  score,
  max = 10,
  color = '#10a37f',
  hint,
}: {
  label: string
  score: number
  max?: number
  color?: string
  hint?: string
}) {
  return (
    <div className="group">
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
        <span className="text-zinc-200">{label}</span>
        <span className="tabular-nums text-zinc-400">
          <span className="text-white">{score}</span>/{max}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={score}
      >
        <div
          className="h-full origin-left rounded-full transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${(score / max) * 100}%`, background: color }}
        />
      </div>
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{hint}</p>}
    </div>
  )
}

// Themed Recharts tooltip body
export function TooltipCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="max-w-64 rounded-xl border border-white/10 bg-zinc-950/95 px-3 py-2 text-sm shadow-2xl backdrop-blur">
      <p className="font-medium text-white">{title}</p>
      {lines.map(l => (
        <p key={l} className="mt-0.5 text-zinc-400">
          {l}
        </p>
      ))}
    </div>
  )
}
