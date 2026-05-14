import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  Download,
  ScanLine,
  Upload,
  Workflow,
} from "lucide-react"

import {
  marketingFooterItems,
  pricingNavItems,
} from "@/components/home/home-content"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Validate PDFs on intake",
    description:
      "Accept multi-file uploads, reject invalid formats immediately, and keep queue position and progress visible from the moment a file enters the system.",
    detail:
      "File type rules, size checks, batch status, and status chips all start here. Bad files are flagged before anything enters extraction.",
  },
  {
    step: "02",
    icon: ScanLine,
    title: "Route statements into extraction",
    description:
      "Send the uploaded PDF through the parsing layer to isolate text, tables, and candidate transaction rows.",
    detail:
      "This is where bank-specific logic and OCR can extend the pipeline later without changing the intake or export flow.",
  },
  {
    step: "03",
    icon: BadgeCheck,
    title: "Normalise rows for export",
    description:
      "Clean extracted data into consistent fields — date, description, debit, credit, balance — so output is ready for spreadsheets or downstream systems.",
    detail:
      "Normalised transactions make CSV and XLSX exports dependable and usable without post-processing.",
  },
  {
    step: "04",
    icon: Download,
    title: "Package outputs with the job",
    description:
      "Store converted files, statuses, and timestamps together so every result stays traceable and easy to retrieve.",
    detail:
      "The same model supports bulk processing and API-based delivery when the platform scales.",
  },
]

const pillars = [
  {
    icon: Workflow,
    title: "Operator-first job flow",
    description:
      "The interface shows what is queued, processing, ready, or needs review — so teams stop losing context between upload and export.",
  },
  {
    icon: Download,
    title: "Export packaging that feels final",
    description:
      "Every successful job can hand back spreadsheet-ready outputs without forcing users to reconstruct files or formats.",
  },
  {
    icon: BadgeCheck,
    title: "Ready for a broader surface",
    description:
      "The data model already makes room for team workspaces, billing, API access, and more specialised bank templates.",
  },
]

export function WorkflowPage() {
  return (
    <main className="bg-background text-foreground">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-foreground/10 bg-[#f5f6ef]">
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-6 lg:px-8 lg:pb-20">
          <SiteHeader navItems={pricingNavItems} />
          <div className="mx-auto max-w-3xl pt-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
              Workflow
            </p>
            <h1 className="mt-4 font-heading text-4xl font-semibold text-foreground sm:text-5xl">
              From upload to export, every step reads clearly.
            </h1>
            <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
              Four stages take a raw bank statement PDF and turn it into a
              clean, downloadable spreadsheet — with full visibility at each
              point.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="border-b border-foreground/10 bg-background">
        <div className="mx-auto max-w-4xl px-6 py-14 lg:px-8 lg:py-20">
          <div className="space-y-5">
            {steps.map((step) => (
              <div
                key={step.step}
                className="rounded-[16px] border border-foreground/10 bg-white p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.25)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="inline-flex h-8 items-center rounded-full border border-[#99f6e4] bg-[#ecfeff] px-4 text-sm font-semibold text-[#0f766e]">
                      Step {step.step}
                    </span>
                    <span className="flex size-9 items-center justify-center rounded-[8px] bg-[#f8faf8] text-[#0f766e]">
                      <step.icon className="size-4" />
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="font-heading text-xl font-semibold text-foreground">
                      {step.title}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {step.description}
                    </p>
                    <div className="mt-4 rounded-[10px] border border-foreground/8 bg-[#f8faf8] px-4 py-3 text-sm leading-7 text-foreground">
                      {step.detail}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-b border-foreground/10 bg-[#f7f8f3]">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-20">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
              Operating principles
            </p>
            <h2 className="mt-4 font-heading text-3xl font-semibold text-foreground">
              Designed around how finance teams actually work.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="rounded-[16px] border border-foreground/10 bg-white p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.25)]"
              >
                <span className="flex size-11 items-center justify-center rounded-[10px] bg-[#ecfeff] text-[#0f766e]">
                  <p.icon className="size-5" />
                </span>
                <p className="mt-4 font-heading text-lg font-semibold text-foreground">
                  {p.title}
                </p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-20">
          <div className="flex flex-col items-center justify-between gap-6 rounded-[16px] border border-foreground/10 bg-white p-8 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.3)] lg:flex-row">
            <div>
              <p className="font-heading text-2xl font-semibold text-foreground">
                Ready to run your first batch?
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Upload is free to try. No account required for a quick test.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/#upload"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full px-6"
                )}
              >
                Upload a batch
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/platform"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-full border-foreground/10 bg-white px-6"
                )}
              >
                Platform overview
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter navItems={marketingFooterItems} />
    </main>
  )
}
