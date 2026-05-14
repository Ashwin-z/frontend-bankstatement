"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Download,
  FileText,
  FolderOpen,
  Lock,
  Sparkles,
} from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import {
  homeNavItems,
  marketingFooterItems,
} from "@/components/home/home-content"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"
import { buttonVariants } from "@/components/ui/button"
import { API_BASE_URL } from "@/lib/api"
import { cn } from "@/lib/utils"

type SavedDocumentRecord = {
  id: string
  originalName: string
  mimeType: string
  sizeBytes: number
  uploadSource: string
  createdAt: string
  downloadPath: string
}

type RetentionSummary = {
  keepsFullHistory: boolean
  limit: number | null
  totalSavedDocuments: number
  note: string
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown date"
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }
  const mb = bytes / (1024 * 1024)
  return `${mb >= 10 ? mb.toFixed(0) : mb.toFixed(1)} MB`
}

export function DocumentsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = useState<SavedDocumentRecord[]>([])
  const [retention, setRetention] = useState<RetentionSummary | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [isLoading, router, user])

  useEffect(() => {
    if (!user) return

    let isMounted = true

    async function load() {
      setIsFetching(true)
      setError(null)

      try {
        const res = await fetch(`${API_BASE_URL}/api/account/settings`, {
          credentials: "include",
        })
        const data = await res.json().catch(() => null)

        if (!res.ok) {
          throw new Error(data?.message || "Could not load documents")
        }

        if (!isMounted) return

        setDocuments(data.savedDocuments.documents)
        setRetention(data.savedDocuments.retention)
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : "Could not load documents")
      } finally {
        if (isMounted) setIsFetching(false)
      }
    }

    void load()
    return () => {
      isMounted = false
    }
  }, [user])

  if (isLoading || !user) {
    return (
      <main className="bg-background text-foreground">
        <section className="min-h-screen bg-[#f5f6ef]" />
      </main>
    )
  }

  return (
    <main className="bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-foreground/10 bg-[#f5f6ef]">
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-6 lg:px-8 lg:pb-20">
          <SiteHeader navItems={homeNavItems} />

          <div className="mx-auto max-w-4xl pt-12">
            <Link
              href="/settings"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-full border-foreground/10 bg-white"
              )}
            >
              <ArrowLeft className="size-4" />
              Settings
            </Link>

            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
              Documents
            </p>
            <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground sm:text-5xl">
              PDF library
            </h1>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              All bank statement PDFs uploaded while signed in. Download any file
              from this page at any time.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-4xl px-6 py-14 lg:px-8 lg:py-20">

          {/* Locked state — accounts that have never purchased */}
          {!user.hasPurchasedCredits && (
            <div className="flex flex-col items-center rounded-[32px] border border-foreground/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,250,248,0.98)_100%)] px-8 py-16 text-center shadow-[0_28px_80px_-54px_rgba(15,23,42,0.18)]">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-[#f8faf8] text-muted-foreground ring-1 ring-foreground/8">
                <Lock className="size-7" />
              </span>
              <p className="mt-6 font-heading text-2xl font-semibold tracking-tight text-foreground">
                PDF library is a paid feature
              </p>
              <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
                Purchase credits or subscribe to a plan to save your bank statement PDFs and
                access them from this page at any time.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/pricing"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "rounded-full px-5 shadow-[0_12px_30px_-20px_rgba(15,118,110,0.8)]"
                  )}
                >
                  <Sparkles className="size-3.5" />
                  View plans
                </Link>
                <Link
                  href="/"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-full border-foreground/10 bg-white"
                  )}
                >
                  Convert a PDF
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          )}

          {user.hasPurchasedCredits && retention && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-foreground/8 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.25)]">
              <div className="flex items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#ecfeff] text-[#0f766e]">
                  <FolderOpen className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Storage policy
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {retention.note}
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-[#99f6e4] bg-[#ecfeff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#0f766e]">
                {retention.totalSavedDocuments}{" "}
                {retention.totalSavedDocuments === 1 ? "file" : "files"} saved
              </span>
            </div>
          )}

          {user.hasPurchasedCredits && (
          <div className="mt-6 space-y-3">
            {isFetching ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-[24px] border border-foreground/8 bg-[#f8faf8]"
                />
              ))
            ) : error ? (
              <div className="rounded-[20px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#991b1b]">
                {error}
              </div>
            ) : documents.length > 0 ? (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-4 rounded-[24px] border border-foreground/8 bg-[#f8faf8] p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0f766e] ring-1 ring-foreground/8">
                      <FileText className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {doc.originalName}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDateTime(doc.createdAt)}</span>
                        <span>·</span>
                        <span>{formatFileSize(doc.sizeBytes)}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`${API_BASE_URL}${doc.downloadPath}`}
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "shrink-0 rounded-full px-4 shadow-[0_12px_30px_-20px_rgba(15,118,110,0.8)]"
                    )}
                  >
                    Download
                    <Download className="size-3.5" />
                  </a>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center rounded-[24px] border border-dashed border-foreground/12 bg-[#f8faf8] p-10 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-[#0f766e] ring-1 ring-foreground/8">
                  <FolderOpen className="size-6" />
                </span>
                <p className="mt-4 text-sm font-semibold text-foreground">
                  No PDFs saved yet
                </p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Upload a bank statement while signed in and it will appear here
                  automatically.
                </p>
                <Link
                  href="/"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "mt-5 rounded-full px-5"
                  )}
                >
                  Upload a PDF
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            )}
          </div>
          )}
        </div>
      </section>

      <SiteFooter navItems={marketingFooterItems} />
    </main>
  )
}
