import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  ShieldCheck,
  Upload,
  Zap,
} from "lucide-react"

import {
  homeNavItems,
  marketingFooterItems,
} from "@/components/home/home-content"
import { UploadIntakePanel } from "@/components/home/upload-intake-panel"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Upload,
    title: "Multi-file batch intake",
    description:
      "Drop one statement or a full working batch. PDF validation and queue status are visible from the first file.",
  },
  {
    icon: FileSpreadsheet,
    title: "Structured transaction rows",
    description:
      "Parsed output lands in clean tabular format — date, description, debit, credit, and balance ready for export.",
  },
  {
    icon: Download,
    title: "CSV and XLSX exports",
    description:
      "Every completed job packages downloadable spreadsheet files without manual formatting or cleanup.",
  },
  {
    icon: ShieldCheck,
    title: "Job-level traceability",
    description:
      "Upload context, parsed rows, and export files stay linked to the same processing record.",
  },
  {
    icon: Zap,
    title: "Built for repeat operations",
    description:
      "Credit-based access, saved document history, and shared credits make daily finance workflows faster.",
  },
  {
    icon: CheckCircle2,
    title: "No manual cleanup required",
    description:
      "Normalised fields mean the output is already usable for reconciliation, review, or downstream systems.",
  },
]

export function HomePage() {
  return (
    <main className="bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-foreground/10 bg-[#f5f6ef]">
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="pointer-events-none absolute -left-24 top-12 h-[420px] w-[420px] rounded-full bg-[#5eead4]/18 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-[380px] w-[380px] rounded-full bg-[#bfdbfe]/45 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-6 lg:px-8 lg:pb-20">
          <SiteHeader navItems={homeNavItems} />

          <div className="mx-auto max-w-3xl pt-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-4 py-2 text-sm text-muted-foreground shadow-[0_16px_40px_-30px_rgba(15,23,42,0.5)] backdrop-blur">
              <ShieldCheck className="size-4 text-[#0f766e]" />
              Bank statement conversion for modern finance operations
            </div>

            <h1 className="mt-8 font-heading text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Turn bank statement PDFs into{" "}
              <span className="text-[#0f766e]">ledger-ready</span> spreadsheets.
            </h1>

            <p className="mt-6 text-base leading-8 text-muted-foreground sm:text-lg">
              Upload one statement or a whole batch. The platform validates
              files, extracts transactions, and packages CSV and XLSX exports
              — all in one workspace.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="#upload"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full px-6 shadow-[0_18px_40px_-28px_rgba(15,118,110,0.8)]"
                )}
              >
                Upload a batch
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/pricing"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-full border-foreground/10 bg-white/70 px-6 backdrop-blur"
                )}
              >
                View pricing
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {[
                "Multi-file PDF intake",
                "CSV + XLSX exports",
                "Job-level status tracking",
                "Credit sharing for teams",
              ].map((signal) => (
                <span
                  key={signal}
                  className="rounded-full border border-white/90 bg-white/85 px-3 py-1.5 text-sm text-foreground shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]"
                >
                  {signal}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Upload panel */}
      <section id="upload" className="border-b border-foreground/10 bg-[#f5f6ef]">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-8">
          <UploadIntakePanel />
        </div>
      </section>

      {/* Features grid */}
      <section className="border-b border-foreground/10 bg-background">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-20">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
              What you get
            </p>
            <h2 className="mt-4 font-heading text-3xl font-semibold text-foreground sm:text-4xl">
              Everything a finance team needs in one flow.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
              From intake to export, every step is visible and traceable.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-[16px] border border-foreground/10 bg-white p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.25)]"
              >
                <span className="flex size-11 items-center justify-center rounded-[10px] bg-[#ecfeff] text-[#0f766e]">
                  <f.icon className="size-5" />
                </span>
                <p className="mt-4 font-heading text-lg font-semibold text-foreground">
                  {f.title}
                </p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-20">
          <div className="flex flex-col items-center justify-between gap-6 rounded-[16px] border border-foreground/10 bg-white p-8 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.3)] lg:flex-row">
            <div>
              <p className="font-heading text-2xl font-semibold text-foreground">
                Ready to scale your statement processing?
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Choose a plan that fits your monthly volume or contact us for a
                custom enterprise setup.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/pricing"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full px-6"
                )}
              >
                View pricing
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-full border-foreground/10 bg-white px-6"
                )}
              >
                Contact sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter navItems={marketingFooterItems} />
    </main>
  )
}
