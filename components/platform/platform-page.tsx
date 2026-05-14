import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  FileText,
  ScanLine,
  ShieldCheck,
  Upload,
} from "lucide-react"

import {
  marketingFooterItems,
  pricingNavItems,
} from "@/components/home/home-content"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const highlights = [
  {
    icon: Upload,
    title: "Queue-aware batch intake",
    description:
      "Accept multi-file uploads with PDF validation, size checks, and real-time queue position — all before extraction begins.",
  },
  {
    icon: ScanLine,
    title: "Structured extraction",
    description:
      "Parsed rows land in a clean tabular model: date, description, debit, credit, and balance. No reformatting required.",
  },
  {
    icon: ShieldCheck,
    title: "Reliable job history",
    description:
      "Every upload, parsed result, and export stays linked to the same processing record for full traceability.",
  },
]

const beforeItems = [
  "Copy-paste rows into a spreadsheet manually",
  "Fix column drift and broken balances",
  "Lose context between file and export",
]

const afterItems = [
  "Validate and queue PDFs instantly",
  "Inspect parsed transactions in one view",
  "Package CSV and XLSX outputs with the job",
]

const proofPoints = [
  {
    icon: Clock3,
    title: "Cut spreadsheet cleanup time",
    description:
      "Move from raw statements to export-ready data without repeated copy, paste, and formatting loops.",
  },
  {
    icon: FileSpreadsheet,
    title: "Usable output from the start",
    description:
      "The exported workbook and CSV are already structured the way finance teams expect — no post-processing needed.",
  },
  {
    icon: FileText,
    title: "Every job easy to review later",
    description:
      "Upload context, parsed rows, and generated files stay connected to the same processing record.",
  },
]

export function PlatformPage() {
  return (
    <main className="bg-background text-foreground">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-foreground/10 bg-[#f5f6ef]">
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-6 lg:px-8 lg:pb-20">
          <SiteHeader navItems={pricingNavItems} />
          <div className="mx-auto max-w-3xl pt-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
              Platform
            </p>
            <h1 className="mt-4 font-heading text-4xl font-semibold text-foreground sm:text-5xl">
              A conversion workspace built for real finance operations.
            </h1>
            <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
              Not just a dropzone. A full pipeline — from intake validation to
              structured export — designed to handle daily statement volume
              without manual cleanup.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/#upload"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full px-6 shadow-[0_18px_40px_-28px_rgba(15,118,110,0.8)]"
                )}
              >
                Try it now
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/pricing"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-full border-foreground/10 bg-white/70 px-6"
                )}
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-b border-foreground/10 bg-background">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-20">
          <div className="grid gap-5 md:grid-cols-3">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="rounded-[16px] border border-foreground/10 bg-white p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.25)]"
              >
                <span className="flex size-11 items-center justify-center rounded-[10px] bg-[#ecfeff] text-[#0f766e]">
                  <h.icon className="size-5" />
                </span>
                <p className="mt-4 font-heading text-lg font-semibold text-foreground">
                  {h.title}
                </p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {h.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before / After */}
      <section className="border-b border-foreground/10 bg-[#f7f8f3]">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-20">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
              Before vs after
            </p>
            <h2 className="mt-4 font-heading text-3xl font-semibold text-foreground">
              From manual effort to structured output.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-[16px] border border-foreground/10 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Before
              </p>
              <p className="mt-3 font-heading text-xl font-semibold text-foreground">
                Manual statement cleanup
              </p>
              <div className="mt-5 space-y-3">
                {beforeItems.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-amber-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[16px] border border-[#0f766e]/20 bg-[linear-gradient(135deg,#12314d_0%,#0f766e_100%)] p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#99f6e4]">
                After
              </p>
              <p className="mt-3 font-heading text-xl font-semibold">
                Structured conversion workspace
              </p>
              <div className="mt-5 space-y-3">
                {afterItems.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-white/85">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#99f6e4]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof points */}
      <section className="border-b border-foreground/10 bg-background">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-20">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-semibold text-foreground">
              Why it matters for daily finance work.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {proofPoints.map((p) => (
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
                Start converting statements today.
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Free to start. Upgrade when your volume grows.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full px-6"
                )}
              >
                Get started free
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/workflow"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-full border-foreground/10 bg-white px-6"
                )}
              >
                See the workflow
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter navItems={marketingFooterItems} />
    </main>
  )
}
