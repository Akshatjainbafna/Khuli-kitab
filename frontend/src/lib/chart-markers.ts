import { getChart, type ChartId } from '@/data/profile'

export type MessageSegment = { type: 'text'; text: string } | { type: 'chart'; id: ChartId }

// Matches a fenced chart marker the LLM (or the chip endpoint) puts in a message:
//   ```chart:skills```   or   ```chart:skills\n```
const MARKER = /```\s*chart:([a-z-]+)\s*```/g

// Splits a message into text and chart segments. Unknown chart ids are dropped so a
// hallucinated id never renders a broken block.
export function splitChartMarkers(content: string): MessageSegment[] {
  const segments: MessageSegment[] = []
  let last = 0
  for (const match of content.matchAll(MARKER)) {
    const before = content.slice(last, match.index)
    if (before.trim()) segments.push({ type: 'text', text: before })
    const meta = getChart(match[1])
    if (meta) segments.push({ type: 'chart', id: meta.id })
    last = match.index + match[0].length
  }
  const rest = content.slice(last)
  if (rest.trim()) segments.push({ type: 'text', text: rest })
  return segments
}
