// Single source of truth for the profile charts (/about page + chart embeds in chat).
// Values marked CONFIRM are drafts from the portfolio interview; verify before relying on them.
// scripts/export-profile.ts turns this file into "Profile at a glance.md" for the vector DB,
// so the chatbot quotes the same numbers the charts show. Keep this file free of path aliases.

export const RESUME_PATH = '/Akshat_Jain_Resume_Sept.pdf'

export type ChartId =
  | 'day'
  | 'skills'
  | 'values'
  | 'process'
  | 'experience'
  | 'ai'
  | 'looking-for'
  | 'projects'

export interface ChartMeta {
  id: ChartId
  chapter: string
  title: string
  navLabel: string
  // Question shown as the user message when the chart is opened from a chip
  question: string
  // Canned assistant copy around the chart when opened from a chip
  intro: string
  takeaway: string
  // Plain-language summary for screen readers
  summary: string
}

export const CHARTS: ChartMeta[] = [
  {
    id: 'day',
    chapter: '01',
    title: 'A day in my life',
    navLabel: 'My day',
    question: 'What does a typical day look like for you?',
    intro:
      "Here's how a typical 9-hour day splits for me as an AI Native Software Engineer at Billeasy. Toggle to see how it shifts on a release day.",
    takeaway:
      'On regular days most of my time goes into building and reviewing. On release days debugging, verification and deploys take over, because a ticketing platform with real payments has to ship safely.',
    summary:
      'Donut chart of a 9-hour workday. Regular day: building features 3.5h, reviewing diffs 1.5h, system design 1h, debugging 1h, learning 0.75h, syncs 0.75h, deploys 0.5h. Release day: debugging 2.5h, building 2h, reviewing 1.5h, deploys 1.5h, syncs 1h, design 0.5h.',
  },
  {
    id: 'skills',
    chapter: '02',
    title: 'How I rate my skills',
    navLabel: 'Skills',
    question: 'How would you rate your skills?',
    intro:
      'This is my honest self-assessment. 10 means I could teach it, 7 means production-confident, 5 means working knowledge. Pick a category to see the individual skills.',
    takeaway:
      "My strongest areas are frontend and data-heavy UIs, backend API design and database performance. DevOps and classical ML are where I'm still building depth.",
    summary:
      'Radar chart of six skill categories rated out of 10: Frontend 9, Backend 8, Databases 8, System design 8, AI and LLM 7, DevOps and Cloud 6.',
  },
  {
    id: 'values',
    chapter: '03',
    title: 'What I value, and what I am working on',
    navLabel: 'Values',
    question: 'What are your values and how self-aware are you?',
    intro:
      'These are the values I actually work by, each with a real example. Next to them: my strengths, and the things I am honestly still working on.',
    takeaway:
      "Ownership and depth over hype drive most of my decisions. I'd rather tell you what I'm still improving than pretend I have no gaps.",
    summary:
      'Six value cards: ownership, depth over hype, users over specs, integrity, AI as a multiplier, good energy in teams. Strengths listed next to growth areas with what I am doing about each.',
  },
  {
    id: 'process',
    chapter: '04',
    title: 'How I plan and execute',
    navLabel: 'Process',
    question: 'How do you plan and execute a task?',
    intro:
      'This is the loop I follow for any feature, from a small fix to a new product like the MMB ferry ticketing. Pick a step to see what I do, which tools I use and a real example.',
    takeaway:
      'I spend a lot of effort before and after the code: understanding, designing and stress-testing up front, then validating and observing in production. AI speeds up the build step, but the thinking stays mine.',
    summary:
      'Seven-step process: Understand 10%, Design 15%, Stress-test 10%, Build 30%, Validate 15%, Ship 5%, Observe 15% of effort.',
  },
  {
    id: 'experience',
    chapter: '05',
    title: 'Experience and domains',
    navLabel: 'Experience',
    question: 'What is your experience and which domains have you worked in?',
    intro:
      'My career from 2022 to today. Switch the lens between roles and domains: EdTech, travel and fintech services, marketing analytics, and transit ticketing and payments.',
    takeaway:
      "Four domains, one common thread: I own products end-to-end and make them fast and reliable at real scale.",
    summary:
      'Timeline: SI Online intern Jan to Apr 2022 (travel and fintech services), Finemate founder May 2022 to Jul 2023 (EdTech), Infinite Analytics software engineer Aug 2023 to Jul 2026 (marketing analytics and BI), Billeasy AI Native Software Engineer Jul 2026 to present (transit ticketing and payments).',
  },
  {
    id: 'ai',
    chapter: '06',
    title: 'What I know in AI',
    navLabel: 'AI',
    question: 'What do you know in AI?',
    intro:
      "My AI knowledge, split honestly into three tiers: what I've shipped in production, what I've built in projects, and what I'm still learning.",
    takeaway:
      "I've shipped RAG and multi-agent systems and I work AI-native every day. I only move something into 'shipped' once I've run it for real.",
    summary:
      'AI skills in three tiers. Shipped in production: multi-agent NL-to-SQL system, RAG, AI-native development with Claude Code and MCP, prompt engineering. Built in projects: LLM-as-judge grading, local open-weight LLMs, classical ML spend recommendation. Learning: Pinecone, Neo4j, Airflow, LlamaIndex, LLM internals.',
  },
  {
    id: 'looking-for',
    chapter: '07',
    title: "What I'm looking for",
    navLabel: 'Looking for',
    question: 'What kind of role are you looking for?',
    intro:
      "I'm looking for a Senior Software Engineer role, hybrid or remote, in Mumbai, Bangalore, Pune, Indore, Ahmedabad, Jaipur, Noida or Gurgaon. I'm open to any company stage. Here's what matters most to me.",
    takeaway:
      "Ownership, hard problems and a healthy culture matter most. I'm fine with intense sprints; permanent firefighting and a toxic culture are the only things I rule out.",
    summary:
      'Priorities out of 10: ownership and impact 10, hard technical problems 9, growth 9, respectful culture 8, sustainable pace 8, AI and data products that help people 7. Senior Software Engineer, hybrid or remote, eight Indian cities, any company stage.',
  },
  {
    id: 'projects',
    chapter: '08',
    title: 'Projects and impact',
    navLabel: 'Projects',
    question: 'What projects are you proud of, and what impact did they have?',
    intro:
      'Here are the measurable wins first, then every project I am proud of. Filter by domain or tech, and open a card for my role and key decisions.',
    takeaway:
      'Across projects the pattern repeats: slow, manual workflows turned into fast, self-serve products. The geospatial reports went from 5 minutes to 15 seconds.',
    summary:
      'Before and after chart: geospatial report load 300s to 15s, campaign dashboard load 180s to 30s. Ten projects: MMB ferry ticketing, Metro PWA and payments, Bus commuter PWA for MSRTC, Purple and Neeta, Bus operator dashboard, Sherlock geospatial dashboard, Sherlock monitoring dashboard, Khuli Kitab, Unhyped (an interactive, fact-checked history of AI), Finemate 2.0 (a social-first dating app matching on communication style), and Finemate (a spaced-repetition learning platform).',
  },
]

export const CHART_IDS = CHARTS.map(c => c.id)

export function getChart(id: string): ChartMeta | undefined {
  return CHARTS.find(c => c.id === id)
}

// Hero chips (the first four recruiters screen on)
export const HERO_CHART_IDS: ChartId[] = ['skills', 'day', 'projects', 'looking-for']

// ---------------------------------------------------------------- 01 Day
export interface DaySlice {
  key: string
  label: string
  regular: number
  release: number
  detail: string
}

// CONFIRM: draft hours from the interview
export const DAY: DaySlice[] = [
  {
    key: 'build',
    label: 'Building features',
    regular: 3.5,
    release: 2,
    detail: 'Implementing features with Claude Code agents: ferry booking, payment flows, dashboard modules.',
  },
  {
    key: 'review',
    label: 'Reviewing diffs & PRs',
    regular: 1.5,
    release: 1.5,
    detail: 'Reading every diff agents or teammates produce. Nothing touching payments merges without me understanding it.',
  },
  {
    key: 'design',
    label: 'System design & planning',
    regular: 1,
    release: 0.5,
    detail: 'Specs, schemas, access patterns and edge cases: what happens when a webhook arrives before the user returns?',
  },
  {
    key: 'debug',
    label: 'Debugging & prod issues',
    regular: 1,
    release: 2.5,
    detail: 'Payment webhook races, stuck orders, reconciliation mismatches, tenant-specific bugs.',
  },
  {
    key: 'sync',
    label: 'Syncs with product & ops',
    regular: 0.75,
    release: 1,
    detail: 'Standups, operator requirements, aligning on API contracts before anyone writes code.',
  },
  {
    key: 'ship',
    label: 'Deploys & verification',
    regular: 0.5,
    release: 1.5,
    detail: 'Release branches, GitOps deploys, verifying the image is live, and watching dashboards after the release.',
  },
  {
    key: 'learn',
    label: 'Learning & new tools',
    regular: 0.75,
    release: 0,
    detail: 'New agent workflows, MCPs, and going deeper on LLM internals and data systems.',
  },
]

// ---------------------------------------------------------------- 02 Skills
export interface Skill {
  name: string
  score: number
}
export interface SkillCategory {
  category: string
  short: string
  score: number
  skills: Skill[]
}

export const SKILL_SCALE = 'Self-assessed · 10 = could teach it · 7 = production-confident · 5 = working knowledge'

// CONFIRM: draft ratings from the interview
export const SKILLS: SkillCategory[] = [
  {
    category: 'Frontend',
    short: 'Frontend',
    score: 9,
    skills: [
      { name: 'React', score: 9 },
      { name: 'Data viz (D3, Plotly, Recharts, Kepler)', score: 9 },
      { name: 'Next.js', score: 8 },
      { name: 'TypeScript', score: 8 },
      { name: 'Tailwind / shadcn', score: 8 },
      { name: 'State (Redux, React Query, Zustand)', score: 8 },
    ],
  },
  {
    category: 'Backend',
    short: 'Backend',
    score: 8,
    skills: [
      { name: 'REST API design', score: 9 },
      { name: 'Python / FastAPI', score: 8 },
      { name: 'Node / Express / Fastify', score: 8 },
      { name: 'Async & event-driven (RabbitMQ, BullMQ)', score: 7 },
      { name: 'Payments integration', score: 7 },
    ],
  },
  {
    category: 'Databases',
    short: 'Databases',
    score: 8,
    skills: [
      { name: 'MongoDB', score: 8 },
      { name: 'PostgreSQL / MySQL', score: 8 },
      { name: 'Redis', score: 8 },
      { name: 'Query optimisation & indexing', score: 8 },
      { name: 'Partitioning & read replicas', score: 7 },
    ],
  },
  {
    category: 'System design',
    short: 'System design',
    score: 8,
    skills: [
      { name: 'Scalability & caching', score: 8 },
      { name: 'Idempotency & reliability', score: 8 },
      { name: 'Trade-off analysis', score: 8 },
      { name: 'Multi-tenancy', score: 7 },
    ],
  },
  {
    category: 'AI / LLM',
    short: 'AI / LLM',
    score: 7,
    skills: [
      { name: 'RAG', score: 8 },
      { name: 'AI-native dev (Claude Code, MCP)', score: 8 },
      { name: 'Prompt engineering', score: 8 },
      { name: 'Agents (LangGraph, LangChain)', score: 7 },
      { name: 'Classical ML (Random Forest, RNN)', score: 5 },
    ],
  },
  {
    category: 'DevOps / Cloud',
    short: 'DevOps',
    score: 6,
    skills: [
      { name: 'Docker', score: 7 },
      { name: 'Observability (New Relic, Sentry)', score: 7 },
      { name: 'AWS', score: 6 },
      { name: 'CI/CD (GitHub Actions, GitOps)', score: 6 },
      { name: 'Nginx / Linux', score: 6 },
    ],
  },
]

// ---------------------------------------------------------------- 03 Values
export interface Value {
  title: string
  belief: string
  evidence: string
}

export const VALUES: Value[] = [
  {
    title: 'Ownership',
    belief: 'I see things through from idea to production, and after.',
    evidence: 'Owned MMB ferry ticketing end-to-end at Billeasy; founded and built Finemate alone.',
  },
  {
    title: 'Depth over hype',
    belief: 'I only claim what I truly understand.',
    evidence: 'Adopted Redis, RabbitMQ and async processing only after hitting the pain they solve on the Sherlock dashboards.',
  },
  {
    title: 'Users over specs',
    belief: 'I push back when a design will fail the people using it.',
    evidence: 'Bridged Customer Success and leadership so the Sherlock dashboard supported real daily workflows.',
  },
  {
    title: 'Integrity',
    belief: 'Long-term trust over short-term wins.',
    evidence: 'In ticketing: no double charges, no silent patches. Mismatches get flagged in reconciliation, not hidden.',
  },
  {
    title: 'AI as a multiplier',
    belief: 'AI speeds me up; it never replaces my judgement.',
    evidence: 'At Billeasy, agents build and a validator reviews, but I read every diff and commit by hand.',
  },
  {
    title: 'Good energy in teams',
    belief: 'Low politics, fast unblocking, shared ownership.',
    evidence: 'Led 4 engineers and 1 designer; mentored a junior engineer until he owned endpoints independently.',
  },
]

export const STRENGTHS: string[] = [
  'System design thinking',
  'Performance optimisation',
  'End-to-end ownership',
  'Working under pressure',
  'Written communication',
]

export interface GrowthArea {
  area: string
  action: string
}

// CONFIRM: the 'action' lines are drafts
export const GROWTH: GrowthArea[] = [
  {
    area: 'Perfectionism slowing execution',
    action: 'Time-boxing design, then shipping behind flags and iterating.',
  },
  {
    area: 'Verbal communication',
    action: 'Writing things down first, then presenting them; speaking up earlier in design reviews.',
  },
  {
    area: 'Deep ML and LLM internals',
    action: 'Studying how transformers and embeddings work, not just the APIs.',
  },
  {
    area: 'Large-scale data systems',
    action: 'Going deeper on streaming, partitioning and query engines like Trino.',
  },
]

// ---------------------------------------------------------------- 04 Process
export interface ProcessStep {
  key: string
  label: string
  effort: number
  what: string
  tools: string[]
  example: string
}

export const PROCESS: ProcessStep[] = [
  {
    key: 'understand',
    label: 'Understand',
    effort: 10,
    what: 'Align with product, ops and UI on the real problem, users and constraints before any code.',
    tools: ['Notion', 'Figma', 'Conversations with users'],
    example: 'Sat with the Customer Success team to learn how they actually analysed campaigns every day.',
  },
  {
    key: 'design',
    label: 'Design',
    effort: 15,
    what: 'Map entities and access patterns; separate read-heavy from write-heavy and IO-bound from CPU-bound work; write schemas, ER diagrams and API contracts.',
    tools: ['Whiteboard', 'ER diagrams', 'API contracts'],
    example: 'Designed idempotent, order-id-keyed ticket issuance for the ferry payment flow.',
  },
  {
    key: 'stress',
    label: 'Stress-test',
    effort: 10,
    what: 'Attack the design: edge cases, race conditions, failure modes, scale. I use AI as a sparring partner here.',
    tools: ['Claude', 'ChatGPT', 'EXPLAIN plans'],
    example: 'Asked: what if the webhook never arrives? What if both the webhook and the redirect issue a ticket?',
  },
  {
    key: 'build',
    label: 'Build',
    effort: 30,
    what: 'Break work into ordered tasks (model, service, route, state, UI) and implement with structured prompts and agents.',
    tools: ['Claude Code', 'Cursor', 'MCPs'],
    example: 'Parallel backend and frontend workstreams, each agent in its own context.',
  },
  {
    key: 'validate',
    label: 'Validate',
    effort: 15,
    what: 'Review every diff, add tests, type-check and lint; think about locking and concurrency.',
    tools: ['Jest', 'Vitest', 'Playwright', 'TypeScript'],
    example: 'A read-only validator agent plus my own review before anything is committed.',
  },
  {
    key: 'ship',
    label: 'Ship',
    effort: 5,
    what: 'Release branches, feature flags for risky changes, GitOps deploys.',
    tools: ['GitHub Actions', 'Bitbucket Pipelines', 'ArgoCD', 'Docker'],
    example: 'Kill switches let behaviour change safely in production without a redeploy.',
  },
  {
    key: 'observe',
    label: 'Observe',
    effort: 15,
    what: 'Watch metrics, errors and real usage; feed learnings back into the next iteration.',
    tools: ['New Relic', 'Sentry', 'Grafana', 'Google Analytics'],
    example: 'Sentry alerts caught a useEffect refetch loop in production; hotfixed, then added guards and feature flags.',
  },
]

// ---------------------------------------------------------------- 05 Experience
export type DomainKey = 'travel' | 'edtech' | 'martech' | 'transit'

export const DOMAINS: Record<DomainKey, { label: string; color: string; stack: string[] }> = {
  travel: {
    label: 'Travel & fintech services',
    color: '#cc79a7',
    stack: ['MERN', 'REST APIs'],
  },
  edtech: {
    label: 'EdTech',
    color: '#e6a23c',
    stack: ['React', 'Flask', 'MongoDB', 'AWS', 'H5P'],
  },
  martech: {
    label: 'Marketing analytics & BI',
    color: '#56b4e9',
    stack: ['React', 'FastAPI', 'MySQL', 'Redis', 'RabbitMQ', 'Trino', 'Kepler.gl', 'LangGraph'],
  },
  transit: {
    label: 'Transit ticketing & payments',
    color: '#10a37f',
    stack: ['Next.js', 'Node/TypeScript', 'MongoDB', 'PostgreSQL', 'Redis', 'Kubernetes'],
  },
}

export interface Role {
  company: string
  title: string
  domain: DomainKey
  // ISO year-month; null end = present
  start: string
  end: string | null
  achievement: string
}

export const ROLES: Role[] = [
  {
    company: 'SI Online',
    title: 'Software Engineering Intern',
    domain: 'travel',
    start: '2022-01',
    end: '2022-04',
    achievement: 'Built backend APIs for IRCTC agent analytics; worked on AEPS and agent registration modules.',
  },
  {
    company: 'Finemate',
    title: 'Founder & Full-Stack Developer',
    domain: 'edtech',
    start: '2022-05',
    end: '2023-07',
    achievement: 'Built a spaced-repetition social learning platform end-to-end, with SSO and a content-creation tool.',
  },
  {
    company: 'Infinite Analytics (Sherlock AI)',
    title: 'Software Engineer',
    domain: 'martech',
    start: '2023-08',
    end: '2026-07',
    achievement: 'Led a Power BI-like platform; geospatial reports 20x faster (5 min to 15 s); multi-agent NL-to-SQL.',
  },
  {
    company: 'Billeasy',
    title: 'AI Native Software Engineer',
    domain: 'transit',
    start: '2026-07',
    end: null,
    achievement: 'Multi-tenant metro, bus and ferry ticketing: 25M+ PWA hits, ~150K daily transactions; owned MMB ferry end-to-end.',
  },
]

// ---------------------------------------------------------------- 06 AI
export type AiTier = 'shipped' | 'built' | 'learning'

export const AI_TIERS: Record<AiTier, { label: string; hint: string }> = {
  shipped: { label: 'Shipped in production', hint: 'Used by real users or a real team' },
  built: { label: 'Built in projects', hint: 'Working projects, not yet at production scale' },
  learning: { label: 'Learning', hint: 'Actively studying; no expertise claimed' },
}

export interface AiItem {
  name: string
  area: string
  tier: AiTier
  where: string
}

export const AI_ITEMS: AiItem[] = [
  {
    name: 'Multi-agent NL-to-SQL',
    area: 'Agents',
    tier: 'shipped',
    where: 'Sherlock AI: natural language to dashboards, charts and executable SQL (LangGraph, LangChain, ChromaDB, Gemini).',
  },
  {
    name: 'RAG',
    area: 'Retrieval',
    tier: 'shipped',
    where: 'Khuli Kitab: this chatbot, with ChromaDB, content-hash dedup and episodic memory.',
  },
  {
    name: 'AI-native development',
    area: 'AI dev tooling',
    tier: 'shipped',
    where: 'Billeasy: Claude Code with agents, skills, hooks and MCPs as a daily workflow.',
  },
  {
    name: 'Prompt engineering',
    area: 'LLM APIs',
    tier: 'shipped',
    where: 'Role-based, chain-of-thought, few-shot and negative prompting across products.',
  },
  {
    name: 'Gemini APIs',
    area: 'LLM APIs',
    tier: 'shipped',
    where: 'Generation and embeddings in Khuli Kitab and the Sherlock NL-to-SQL system.',
  },
  {
    name: 'MCP',
    area: 'AI dev tooling',
    tier: 'shipped',
    where: 'Connecting agents to tickets, logs and databases for investigation and building.',
  },
  {
    name: 'LLM-as-judge grading',
    area: 'LLM APIs',
    tier: 'built',
    where: 'Unhyped: quiz answers double-graded by a pinned model with a median tie-break and prompt-injection flags.',
  },
  {
    name: 'Local open-weight LLMs (Ollama, Qwen 2.5)',
    area: 'LLM APIs',
    tier: 'built',
    where: "Finemate 2.0: a FastAPI engine that builds each user's communication fingerprint from real chats.",
  },
  {
    name: 'Spend recommendation (Random Forest, RNN)',
    area: 'Classical ML',
    tier: 'built',
    where: 'Segment-level spend recommendation engine with MinMaxScaler and TensorFlow/Keras.',
  },
  {
    name: 'CAG (cache-augmented generation)',
    area: 'Retrieval',
    tier: 'learning',
    where: 'Preloading a small, stable knowledge base into context instead of retrieving it.',
  },
  { name: 'Pinecone', area: 'Retrieval', tier: 'learning', where: 'Managed vector search at scale.' },
  { name: 'Neo4j / graph RAG', area: 'Retrieval', tier: 'learning', where: 'Knowledge graphs for retrieval.' },
  { name: 'LlamaIndex', area: 'Agents', tier: 'learning', where: 'Alternative orchestration for retrieval pipelines.' },
  { name: 'Airflow', area: 'Data', tier: 'learning', where: 'Orchestrating ML and data pipelines.' },
  { name: 'LLM internals', area: 'Foundations', tier: 'learning', where: 'How transformers, attention and embeddings actually work.' },
]

// ---------------------------------------------------------------- 07 Looking for
export const LOOKING_FOR = {
  role: 'Senior Software Engineer',
  workMode: 'Hybrid or remote',
  locations: ['Mumbai', 'Bangalore', 'Pune', 'Indore', 'Ahmedabad', 'Jaipur', 'Noida', 'Gurgaon'],
  stage: 'Open to any company stage',
  priorities: [
    { label: 'Ownership & impact', weight: 10, why: 'I do my best work when a system is mine end-to-end.' },
    { label: 'Hard technical problems', weight: 9, why: 'Scale, AI and data problems keep me sharp and energised.' },
    { label: 'Growth & learning', weight: 9, why: 'I want to keep levelling up, technically and as a leader.' },
    { label: 'Respectful, low-politics culture', weight: 8, why: 'Sharp people, honest feedback, shared ownership.' },
    { label: 'Sustainable pace', weight: 8, why: 'Intense sprints are fine; permanent firefighting is not.' },
    { label: 'Products that help people', weight: 7, why: 'Like transit ticketing: software millions rely on every day.' },
  ],
  mustHaves: [
    'Real ownership of features and systems',
    'A respectful, low-politics culture',
    'A sustainable pace with real work-life balance',
    'Room to grow into senior technical leadership',
  ],
  niceToHaves: [
    'AI-native engineering practices',
    'Data-heavy or AI/ML products',
    'Products with real-world impact at scale',
    'A fast-moving team that ships often',
  ],
}

// ---------------------------------------------------------------- 08 Projects
export interface ImpactMetric {
  label: string
  project: string
  unit: string
  before: number
  after: number
}

export const IMPACT: ImpactMetric[] = [
  { label: 'Geospatial report load', project: 'Sherlock Geospatial Dashboard', unit: 's', before: 300, after: 15 },
  { label: 'Campaign dashboard load', project: 'Sherlock Monitoring Dashboard', unit: 's', before: 180, after: 30 },
  // CONFIRM: add Billeasy metrics once available
]

export interface Project {
  id: string
  name: string
  org: string
  year: string
  domain: DomainKey | 'ai' | 'social'
  pitch: string
  metric?: string
  role: string
  decisions: string[]
  tech: string[]
  links?: { label: string; href: string }[]
}

export const PROJECT_DOMAIN_LABELS: Record<Project['domain'], string> = {
  transit: 'Transit & payments',
  martech: 'Analytics & BI',
  edtech: 'EdTech',
  travel: 'Travel & fintech',
  ai: 'AI',
  social: 'Consumer social',
}

export const PROJECTS: Project[] = [
  {
    id: 'mmb',
    name: 'MMB Ferry Ticketing',
    org: 'Billeasy',
    year: '2026',
    domain: 'transit',
    pitch: 'Digital ferry ticketing for Maharashtra Maritime Board on a multi-tenant transit platform.',
    role: 'Owned end-to-end: frontend, backend and database.',
    decisions: [
      'Extended the shared platform as a new tenant instead of building a separate app',
      'Idempotent ticket issuance keyed on order id, backed by a unique index',
      'Success page polls the backend; the redirect URL is never trusted',
    ],
    tech: ['Next.js', 'Node.js', 'TypeScript', 'MongoDB', 'Redis', 'Payments'],
  },
  {
    id: 'metro',
    name: 'Metro Commuter PWA & Payments',
    org: 'Billeasy',
    year: '2026',
    domain: 'transit',
    pitch: 'One codebase serving Mumbai, Hyderabad, Nagpur, Pune and Noida Metro commuters.',
    metric: '25M+ PWA hits · ~150K txns/day',
    role: 'Built commuter-facing and payment features.',
    decisions: [
      'Database per tenant through one shared connection pool',
      'Refunds as preview, then explicit commit, via the originating gateway',
      'IndexedDB-persisted state; live e-tickets excluded from persistence',
    ],
    tech: ['Next.js', 'React', 'Redux Toolkit', 'Node.js', 'MongoDB', 'Kafka'],
  },
  {
    id: 'bus-pwa',
    name: 'Bus Commuter PWA',
    org: 'Billeasy',
    year: '2026',
    domain: 'transit',
    pitch: 'White-label bus ticketing PWA for MSRTC, Purple and Neeta: booking, seats, passes, QR tickets.',
    metric: 'Part of 25M+ PWA hits · ~150K txns/day',
    role: 'Built and scaled the commuter PWA across bus tenants.',
    decisions: [
      'Operator resolved from subdomain; branding and rules are config',
      '10-min fare lock and 7-min seat hold to prevent double-booking',
      'Rotating TOTP pass QRs so screenshots expire in 30 seconds',
    ],
    tech: ['Next.js', 'React', 'TanStack Query', 'Fastify', 'PostgreSQL', 'Redis'],
  },
  {
    id: 'bus',
    name: 'Bus Operator Dashboard',
    org: 'Billeasy',
    year: '2026',
    domain: 'transit',
    pitch: 'Operator dashboard for MSRTC and Neeta: routes, fares, passes, dispatch and operators.',
    role: 'Developed operational workflows and backend/data integrations.',
    decisions: [
      'Backend-for-frontend: tokens in HttpOnly cookies, silent refresh',
      'Graceful degradation with a "degraded services" banner',
      'English, Hindi and Marathi from day one',
    ],
    tech: ['Next.js', 'React 19', 'Tailwind', 'shadcn/ui', 'TanStack', 'Fastify', 'PostgreSQL'],
  },
  {
    id: 'geo',
    name: 'Geospatial & Audience Dashboard',
    org: 'Sherlock AI',
    year: '2024–26',
    domain: 'martech',
    pitch: 'Explore GB-scale location and visitation data on maps and build niche audiences by joining datasets.',
    metric: '5 min → 15 s',
    role: 'Owned features and performance end-to-end.',
    decisions: [
      'Viewport-based fetching plus SSE streaming',
      'Memoised Kepler/deck.gl layers to stop re-renders',
      'React Query, IndexedDB and Redis chunk caches',
    ],
    tech: ['React', 'Kepler.gl', 'deck.gl', 'FastAPI', 'Redis', 'Trino'],
  },
  {
    id: 'monitoring',
    name: 'Monitoring & Analytics Dashboard',
    org: 'Sherlock AI',
    year: '2023–25',
    domain: 'martech',
    pitch: 'A Power BI-like platform comparing 30+ KPIs across Google and Meta campaigns.',
    metric: '3 min → 30 s',
    role: 'Led it end-to-end: architecture to deployment.',
    decisions: [
      'MySQL for relational data with transaction safety',
      'Monthly range partitioning plus read replicas',
      'Chart computation split into its own service (CQRS)',
    ],
    tech: ['React', 'FastAPI', 'MySQL', 'Redis', 'RabbitMQ', 'Plotly', 'D3'],
  },
  {
    id: 'khuli-kitab',
    name: 'Khuli Kitab',
    org: 'Personal',
    year: '2025–26',
    domain: 'ai',
    pitch: 'This chatbot: a RAG knowledge base over my documents, with charts like this one.',
    role: 'Built and deployed solo.',
    decisions: [
      'Content-hash deduplication so unchanged chunks are never re-embedded',
      'Episodic memory plus persistent chat history',
      'Docker on OCI behind Nginx, with CI/CD via GitHub Actions',
    ],
    tech: ['FastAPI', 'LangChain', 'ChromaDB', 'Gemini', 'Next.js', 'MongoDB'],
    links: [{ label: 'GitHub', href: 'https://github.com/Akshatjainbafna/Khuli-kitab' }],
  },
  {
    id: 'unhyped',
    name: 'Unhyped',
    org: 'Personal',
    year: '2026',
    domain: 'ai',
    pitch: 'The history of AI as a road you travel backwards in time, with every hyped claim checked against reality.',
    metric: '354 sourced entries · 57 claims fact-checked',
    role: 'Solo: product, research, data and full-stack/3D, with Claude as a coding pair.',
    decisions: [
      'Schema-validated dataset; only verified quotes render as quotes',
      'WebGL world with HTML overlays: crisp, accessible, cheap filtering',
      'Double-graded LLM quiz scoring with a median tie-break',
    ],
    tech: ['Next.js', 'React Three Fiber', 'TypeScript', 'Zod', 'OpenRouter', 'Vercel'],
    links: [{ label: 'GitHub', href: 'https://github.com/Akshatjainbafna/unhyped/tree/feat/unhyped-v2-2d' }],
  },
  {
    id: 'finemate2',
    name: 'Finemate 2.0',
    org: 'Founder',
    year: '2026',
    domain: 'social',
    pitch: 'Social-first dating app for India that matches people on how they text, not how they look.',
    metric: '~62K lines of TypeScript, built solo',
    role: 'Solo founder-engineer: product, mobile, backend and ML services.',
    decisions: [
      'Questionnaire proxy solves cold start for behaviour-based matching',
      'Social feed first, dating as an opt-in layer, to remove stigma',
      'Verification-gated matching plus a 7-day gender lock',
    ],
    tech: ['React Native', 'Expo', 'Hono', 'PostgreSQL', 'Socket.io', 'FastAPI', 'Local LLM'],
    // CONFIRM: add the GitHub link if the repo is public, or the landing page once live
  },
  {
    id: 'finemate',
    name: 'Finemate',
    org: 'Founder',
    year: '2022–23',
    domain: 'edtech',
    pitch: 'A "retention engine": social learning built on spaced repetition and gamification.',
    role: 'Owned everything: idea, design, code, content.',
    decisions: [
      'MongoDB for a fast-changing social schema',
      'S3 for images instead of base64 in the database',
      'H5P plus WYSIWYG for no-code interactive lessons',
    ],
    tech: ['React', 'Flask', 'MongoDB', 'Material UI', 'AWS'],
    links: [{ label: 'GitHub', href: 'https://github.com/Akshatjainbafna/finemate-23-09' }],
  },
]
