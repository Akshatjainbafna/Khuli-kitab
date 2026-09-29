// Generates "Profile at a glance.md" from src/data/profile.ts so the chatbot's knowledge
// base quotes the same numbers the charts show. Upload the output to the Drive folder.
//
//   node scripts/export-profile.ts > "Profile at a glance.md"
//
// Needs Node 22.18+ (built-in TypeScript type stripping).
import {
  AI_ITEMS,
  AI_TIERS,
  DAY,
  DOMAINS,
  GROWTH,
  IMPACT,
  LOOKING_FOR,
  PROCESS,
  PROJECTS,
  ROLES,
  SKILLS,
  SKILL_SCALE,
  STRENGTHS,
  VALUES,
} from '../src/data/profile.ts'

const out: string[] = []
const h = (s: string) => out.push(`\n## ${s}\n`)
const p = (s: string) => out.push(s)

p('# Akshat Jain: Profile at a glance')
p('This document mirrors the interactive charts on the Khuli Kitab profile page. Each section is self-contained.')

h('A typical day (how Akshat spends his time)')
p('On a regular 9-hour working day at Billeasy, my time splits like this:')
DAY.filter(d => d.regular > 0).forEach(d => p(`- ${d.label}: ${d.regular} hours. ${d.detail}`))
p('\nOn a release day it shifts like this:')
DAY.filter(d => d.release > 0).forEach(d => p(`- ${d.label}: ${d.release} hours`))

h('Skill ratings (self-assessed, out of 10)')
p(`Scale: ${SKILL_SCALE}.`)
SKILLS.forEach(c => {
  p(`\n${c.category}: ${c.score}/10 overall.`)
  c.skills.forEach(s => p(`- ${s.name}: ${s.score}/10`))
})

h('My values and self-awareness')
VALUES.forEach(v => p(`- ${v.title}: ${v.belief} Example: ${v.evidence}`))
p(`\nMy strengths: ${STRENGTHS.join(', ')}.`)
p('\nWhat I am working on (my weaknesses and what I do about them):')
GROWTH.forEach(g => p(`- ${g.area}: ${g.action}`))

h('How I plan and execute tasks')
PROCESS.forEach((s, i) => p(`${i + 1}. ${s.label} (about ${s.effort}% of effort): ${s.what} Tools: ${s.tools.join(', ')}. Example: ${s.example}`))

h('Experience and domains')
p(
  'How many years of experience do I have? I have 4+ years of professional software engineering experience (since January 2022), ' +
    'across transit ticketing and payments (Billeasy), marketing analytics and BI (Infinite Analytics / Sherlock AI), EdTech (my startup Finemate) and travel/fintech services (SI Online).'
)
ROLES.forEach(r =>
  p(`- ${r.title} at ${r.company} (${r.start} to ${r.end ?? 'present'}), domain: ${DOMAINS[r.domain].label}. ${r.achievement}`)
)

h('What I know in AI')
;(Object.keys(AI_TIERS) as (keyof typeof AI_TIERS)[]).forEach(t => {
  p(`\n${AI_TIERS[t].label} (${AI_TIERS[t].hint}):`)
  AI_ITEMS.filter(i => i.tier === t).forEach(i => p(`- ${i.name} (${i.area}): ${i.where}`))
})

h("What I'm looking for")
p(`Role: ${LOOKING_FOR.role}. Work mode: ${LOOKING_FOR.workMode}. Locations: ${LOOKING_FOR.locations.join(', ')}. ${LOOKING_FOR.stage}.`)
p('\nWhat matters most to me (weight out of 10):')
LOOKING_FOR.priorities.forEach(x => p(`- ${x.label}: ${x.weight}/10. ${x.why}`))
p(`\nMust-haves: ${LOOKING_FOR.mustHaves.join('; ')}.`)
p(`Nice-to-haves: ${LOOKING_FOR.niceToHaves.join('; ')}.`)
p('The only things I rule out are a toxic work culture and no work-life balance.')

h('Projects and measured impact')
IMPACT.forEach(m => p(`- ${m.label} (${m.project}): ${m.before}${m.unit} before, ${m.after}${m.unit} after (${Math.round(m.before / m.after)}x faster).`))
PROJECTS.forEach(pr =>
  p(`\n${pr.name} (${pr.org}, ${pr.year}): ${pr.pitch}${pr.metric ? ` Impact: ${pr.metric}.` : ''} My role: ${pr.role} Key decisions: ${pr.decisions.join('; ')}. Tech: ${pr.tech.join(', ')}.`)
)

console.log(out.join('\n'))
