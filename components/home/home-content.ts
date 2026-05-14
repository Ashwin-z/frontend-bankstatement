import type { LucideIcon } from "lucide-react"
import {
  BadgeCheck,
  Building2,
  Clock3,
  Download,
  FileSpreadsheet,
  FileText,
  LockKeyhole,
  ScanLine,
  ShieldCheck,
  Upload,
  Workflow,
  Zap,
} from "lucide-react"

export type NavItem = {
  href: string
  label: string
}

export type HeroMetric = {
  label: string
  value: string
  note: string
}

export type FeatureItem = {
  icon: LucideIcon
  title: string
  description: string
}

export type WorkflowStep = {
  step: string
  title: string
  description: string
  detail: string
}

export type PricingPlan = {
  badge: string
  name: string
  fitLabel: string
  billing: string
  description: string
  bullets: string[]
  ctaLabel: string
  ctaHref: string
  featured?: boolean
}

export type UploadJob = {
  name: string
  pages: string
  progress: number
  status: string
  tone: "success" | "warning" | "default"
}

export type TransactionRow = {
  date: string
  description: string
  debit: string
  credit: string
  balance: string
}

export type ComparisonRow = {
  label: string
  starter: string
  growth: string
  scale: string
}

export type FaqItem = {
  question: string
  answer: string
}

export const homeNavItems: NavItem[] = [
  { href: "/platform", label: "Platform" },
  { href: "/workflow", label: "Workflow" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
]

export const pricingNavItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/platform", label: "Platform" },
  { href: "/workflow", label: "Workflow" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
]

export const marketingFooterItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/platform", label: "Platform" },
  { href: "/workflow", label: "Workflow" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
]

export const heroSignals = [
  "Multi-file PDF intake",
  "Excel + CSV exports",
  "Job-level status tracking",
  "OCR and queue ready",
]

export const heroMetrics: HeroMetric[] = [
  {
    label: "Extraction model",
    value: "5 canonical transaction fields",
    note: "Date, description, debit, credit, and balance stay mapped and exportable.",
  },
  {
    label: "Operational visibility",
    value: "Every file stays attached to a job",
    note: "Upload, parsing, review, and download are visible in one workspace.",
  },
  {
    label: "Scale runway",
    value: "Built to expand beyond manual batches",
    note: "ZIP uploads, OCR, API access, and workers can layer onto the same flow.",
  },
]

export const platformHighlights: FeatureItem[] = [
  {
    icon: Upload,
    title: "Upload like a real operations tool",
    description:
      "The intake layer is designed around queues, validation, and batch awareness so uploads feel controlled from the first interaction.",
  },
  {
    icon: ScanLine,
    title: "Structured extraction instead of messy output",
    description:
      "Parsed rows land in a clean tabular model that finance teams can inspect, reconcile, and export without reworking the data manually.",
  },
  {
    icon: ShieldCheck,
    title: "Confidence built into the workflow",
    description:
      "Job history, export packaging, and review states make the product feel reliable enough for daily financial operations.",
  },
]

export const workflowSteps: WorkflowStep[] = [
  {
    step: "01",
    title: "Validate PDFs on intake",
    description:
      "Accept multi-file uploads, reject invalid formats early, and keep progress visible from the moment a file enters the queue.",
    detail: "File rules, size checks, queue position, and status chips all start here.",
  },
  {
    step: "02",
    title: "Route statements into extraction",
    description:
      "Send the uploaded PDF through the Python parsing layer to isolate text, tables, and candidate transaction rows.",
    detail: "This is where OCR and bank-detection logic can extend the pipeline later.",
  },
  {
    step: "03",
    title: "Normalize rows for export",
    description:
      "Clean the extracted data into consistent fields so the output is ready for spreadsheets, accounting review, or downstream systems.",
    detail: "Normalized transactions make CSV and XLSX exports dependable.",
  },
  {
    step: "04",
    title: "Package outputs with the job",
    description:
      "Store converted files, statuses, and timestamps together so every result stays traceable and easy to retrieve.",
    detail: "The same model supports bulk processing and API-based delivery later.",
  },
]

export const operatingPillars: FeatureItem[] = [
  {
    icon: Workflow,
    title: "Operator-first job flow",
    description:
      "The interface shows what is queued, processing, ready, or needs review so teams stop losing context between upload and export.",
  },
  {
    icon: Download,
    title: "Export packaging that feels final",
    description:
      "Every successful job can hand back spreadsheet-ready outputs without forcing users to reconstruct files or formats later.",
  },
  {
    icon: BadgeCheck,
    title: "Ready for a broader SaaS surface",
    description:
      "The visual system and data model already make room for team workspaces, billing, API access, and more specialized bank templates.",
  },
]

export const scalePillars: FeatureItem[] = [
  {
    icon: Building2,
    title: "Built for growing document volume",
    description:
      "The architecture separates UI, API, and extraction logic so higher-throughput processing does not force a frontend redesign later.",
  },
  {
    icon: LockKeyhole,
    title: "A better base for compliance and review",
    description:
      "Jobs, files, exports, and timestamps already create the shape needed for stronger audit trails and operational controls.",
  },
  {
    icon: Zap,
    title: "Queue, OCR, and automation friendly",
    description:
      "Redis, BullMQ, OCR, and API delivery can expand the system without breaking the mental model users learn on day one.",
  },
]

export const roadmapTopics = [
  "Bulk ZIP upload lanes",
  "Scanned PDF OCR fallback",
  "AI-based bank template detection",
  "Workspace billing and credits",
  "Customer API for batch submission",
  "Cloud storage and worker orchestration",
]

export const pricingPlans: PricingPlan[] = [
  {
    badge: "Starter volume",
    name: "Launch Room",
    fitLabel: "For solo users and small recurring statement batches.",
    billing: "$25 / month",
    description:
      "440 page credits per month with paid document retention unlocked.",
    bullets: [
      "Around 220 saved PDFs at 2 credits each",
      "CSV and XLSX exports",
      "Saved PDF history beyond the free limit",
    ],
    ctaLabel: "Buy Launch Room",
    ctaHref: "/pricing",
  },
  {
    badge: "Most balanced",
    name: "Ledger Pro",
    fitLabel: "For repeat document processing and regular finance work.",
    billing: "$55 / month",
    description:
      "1,150 page credits per month with sharing controls for invited emails.",
    bullets: [
      "Around 575 saved PDFs at 2 credits each",
      "Owner-controlled shared credit limits",
      "Better fit for small teams and accountants",
    ],
    ctaLabel: "Buy Ledger Pro",
    ctaHref: "/pricing",
    featured: true,
  },
  {
    badge: "High volume",
    name: "Batch Business",
    fitLabel: "For larger queues and teams processing frequent batches.",
    billing: "$90 / month",
    description:
      "4,500 page credits per month for higher-volume operations.",
    bullets: [
      "Around 2,250 saved PDFs at 2 credits each",
      "Team credit sharing and account retention",
      "Built for ongoing statement operations",
    ],
    ctaLabel: "Buy Batch Business",
    ctaHref: "/pricing",
  },
]

export const uploadJobs: UploadJob[] = [
  {
    name: "Standard Chartered-Apr-2026.pdf",
    pages: "12 pages",
    progress: 100,
    status: "Export package ready",
    tone: "success",
  },
  {
    name: "Deutsche-Q1-2026.pdf",
    pages: "18 pages",
    progress: 82,
    status: "Extracting ledger rows",
    tone: "warning",
  },
  {
    name: "UBL-Supplier-Set.pdf",
    pages: "9 pages",
    progress: 36,
    status: "Validated and queued",
    tone: "default",
  },
]

export const transactionRows: TransactionRow[] = [
  {
    date: "02 Apr 2026",
    description: "Online transfer - Vendor payout",
    debit: "12,450.00",
    credit: "-",
    balance: "842,114.27",
  },
  {
    date: "03 Apr 2026",
    description: "Incoming payment - Retail settlement",
    debit: "-",
    credit: "68,200.00",
    balance: "910,314.27",
  },
  {
    date: "04 Apr 2026",
    description: "Bank charges",
    debit: "350.00",
    credit: "-",
    balance: "909,964.27",
  },
  {
    date: "05 Apr 2026",
    description: "Cash deposit",
    debit: "-",
    credit: "25,000.00",
    balance: "934,964.27",
  },
]

export const comparisonRows: ComparisonRow[] = [
  {
    label: "Best fit",
    starter: "Solo operators and analysts",
    growth: "Recurring finance workflows",
    scale: "High-volume operations and BPOs",
  },
  {
    label: "Throughput expectation",
    starter: "Smaller recurring batches",
    growth: "Monthly team processing",
    scale: "4k-5k PDFs and rollout planning",
  },
  {
    label: "Export formats",
    starter: "CSV + XLSX",
    growth: "CSV + XLSX",
    scale: "CSV + XLSX + custom delivery",
  },
  {
    label: "OCR roadmap access",
    starter: "Later",
    growth: "Priority rollout",
    scale: "Custom implementation",
  },
  {
    label: "API and automation path",
    starter: "Future upgrade",
    growth: "Pilot-ready",
    scale: "Program-based access",
  },
  {
    label: "Support model",
    starter: "Email support",
    growth: "Priority onboarding",
    scale: "Dedicated rollout support",
  },
]

export const faqItems: FaqItem[] = [
  {
    question: "Why avoid final price numbers right now?",
    answer:
      "This first pass is about nailing the positioning and packaging model before you lock billing. The UI is structured so real prices can be dropped in later without redesigning the page.",
  },
  {
    question: "Can this pricing model support future credits and billing?",
    answer:
      "Yes. The plan structure already maps cleanly to usage credits, seats, enterprise onboarding, and API-based add-ons once the product matures.",
  },
  {
    question: "Will the same design system carry into login, dashboard, and upload pages?",
    answer:
      "That is the goal of this refactor. The new typography, cards, spacing, and shared marketing components create a strong base for the rest of the frontend.",
  },
]

export const proofPoints = [
  {
    icon: Clock3,
    title: "Cut spreadsheet cleanup work",
    description:
      "Users should move from raw statements to export-ready data without the repeated copy, paste, and formatting loops.",
  },
  {
    icon: FileSpreadsheet,
    title: "Keep the spreadsheet output usable",
    description:
      "The final workbook and CSV should already look like something an operations team can act on immediately.",
  },
  {
    icon: FileText,
    title: "Make every job easy to review later",
    description:
      "Upload context, parsed rows, and generated files stay connected to the same processing record.",
  },
]
