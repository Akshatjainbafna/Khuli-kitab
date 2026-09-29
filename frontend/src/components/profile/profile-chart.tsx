'use client'
import type { ChartId } from '@/data/profile'
import { AiTiers } from './ai-tiers'
import { DayChart } from './day-chart'
import { ExperienceTimeline } from './experience-timeline'
import { LookingFor } from './looking-for'
import { ProcessStepper } from './process-stepper'
import { ProjectsSection } from './projects-section'
import { SkillsChart } from './skills-chart'
import { ValuesSection } from './values-section'

const REGISTRY: Record<ChartId, React.ComponentType<{ compact?: boolean }>> = {
  day: DayChart,
  skills: SkillsChart,
  values: ValuesSection,
  process: ProcessStepper,
  experience: ExperienceTimeline,
  ai: AiTiers,
  'looking-for': LookingFor,
  projects: ProjectsSection,
}

export default function ProfileChart({ id, compact }: { id: ChartId; compact?: boolean }) {
  const Chart = REGISTRY[id]
  return <Chart compact={compact} />
}
