"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  History,
  Share2,
  Users,
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

type CreditHistoryEntry = {
  id: string
  type: "grant" | "usage" | "purchase" | "adjustment"
  amount: number
  balanceAfter: number
  note: string
  source: string | null
  relatedDocumentIds: string[]
  createdAt: string
}

type CreditShareRecord = {
  id: string
  recipientEmail: string
  recipientName?: string | null
  ownerEmail?: string | null
  ownerName?: string
  creditLimit: number
  creditsUsed: number
  creditsRemaining: number
  status: "active" | "paused"
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

function formatCreditAmount(amount: number) {
  return `${amount > 0 ? "+" : ""}${amount}`
}

const TYPE_LABEL: Record<CreditHistoryEntry["type"], string> = {
  grant: "Grant",
  usage: "Usage",
  purchase: "Purchase",
  adjustment: "Adjustment",
}

function UsageBar({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>{used} used</span>
        <span>{limit - used} remaining of {limit}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/8">
        <div
          className="h-full rounded-full bg-[#0f766e] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function CreditsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [entries, setEntries] = useState<CreditHistoryEntry[]>([])
  const [creditsBalance, setCreditsBalance] = useState<number | null>(null)
  const [windowDays, setWindowDays] = useState(28)
  const [usageModelNote, setUsageModelNote] = useState("")
  const [managedShares, setManagedShares] = useState<CreditShareRecord[]>([])
  const [receivedShares, setReceivedShares] = useState<CreditShareRecord[]>([])
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
          throw new Error(data?.message || "Could not load credit history")
        }

        if (!isMounted) return

        setEntries(data.creditHistory.entries)
        setCreditsBalance(data.subscription.creditsBalance)
        setWindowDays(data.creditHistory.windowDays)
        setUsageModelNote(data.creditHistory.usageModelNote)
        setManagedShares(data.creditSharing.managed)
        setReceivedShares(data.creditSharing.received)
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : "Could not load credit history")
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

  const hasSharedActivity = managedShares.length > 0 || receivedShares.length > 0

  return (
    <main className="bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-foreground/10 bg-[#f5f6ef]">
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-6 lg:px-8 lg:pb-20">
          <SiteHeader navItems={homeNavItems} />

          <div className="mx-auto max-w-3xl pt-12">
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
              Credits
            </p>
            <h1 className="mt-3 font-heading text-4xl font-semibold text-foreground sm:text-5xl">
              Credit history
            </h1>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              Your last {windowDays} days of credit activity — grants, usage, and
              balance after each event. Shared credit usage is tracked separately
              below.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-3xl px-6 py-14 lg:px-8 lg:py-20 space-y-14">

          {/* Balance card */}
          {creditsBalance !== null && (
            <div className="flex items-center gap-4 rounded-[24px] border border-foreground/8 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.25)]">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#ecfeff] text-[#0f766e]">
                <CreditCard className="size-5" />
              </span>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Current balance
                </p>
                <p className="mt-1 font-heading text-2xl font-semibold text-foreground">
                  {creditsBalance} credits
                </p>
              </div>
              <Link
                href="/pricing"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "shrink-0 rounded-full px-4"
                )}
              >
                Buy more
                <ArrowRight className="size-4" />
              </Link>
            </div>
          )}

          {/* Transaction history */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#ecfeff] text-[#0f766e]">
                <History className="size-4" />
              </span>
              <div>
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  Transaction log
                </h2>
                <p className="text-xs text-muted-foreground">Last {windowDays} days</p>
              </div>
            </div>

            {usageModelNote && (
              <div className="mb-5 rounded-[20px] border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-sm leading-7 text-[#1d4ed8]">
                {usageModelNote}
              </div>
            )}

            <div className="space-y-3">
              {isFetching ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-[24px] border border-foreground/8 bg-[#f8faf8]"
                  />
                ))
              ) : error ? (
                <div className="rounded-[20px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#991b1b]">
                  {error}
                </div>
              ) : entries.length > 0 ? (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="grid gap-4 rounded-[24px] border border-foreground/8 bg-[#f8faf8] p-4 sm:grid-cols-[minmax(0,1fr)_100px_120px]"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {entry.note}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full border border-foreground/10 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
                          {TYPE_LABEL[entry.type]}
                        </span>
                        <span>{formatDateTime(entry.createdAt)}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Change
                      </p>
                      <p
                        className={cn(
                          "mt-2 text-lg font-semibold tracking-tight",
                          entry.amount >= 0 ? "text-[#0f766e]" : "text-foreground"
                        )}
                      >
                        {formatCreditAmount(entry.amount)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Balance after
                      </p>
                      <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                        {entry.balanceAfter}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center rounded-[24px] border border-dashed border-foreground/12 bg-[#f8faf8] p-10 text-center">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-[#0f766e] ring-1 ring-foreground/8">
                    <History className="size-6" />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-foreground">
                    No activity yet
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Credit grants, usage, and balance snapshots will appear here as
                    you use the platform.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Shared credits section */}
          {!isFetching && hasSharedActivity && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-[#ecfeff] text-[#0f766e]">
                  <Share2 className="size-4" />
                </span>
                <div>
                  <h2 className="font-heading text-xl font-semibold text-foreground">
                    Shared credits
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Allocation and usage across all shared pools
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Credits I manage (outgoing) */}
                {managedShares.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="size-4 text-muted-foreground" />
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Credits I'm sharing
                      </p>
                    </div>
                    <div className="space-y-3">
                      {managedShares.map((share) => (
                        <div
                          key={share.id}
                          className="rounded-[22px] border border-foreground/8 bg-[#f8faf8] p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {share.recipientEmail}
                              </p>
                              <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                {share.status}
                              </p>
                            </div>
                            <span
                              className={cn(
                                "shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
                                share.creditsUsed === 0
                                  ? "border border-foreground/10 bg-white text-muted-foreground"
                                  : "border border-[#99f6e4] bg-[#ecfeff] text-[#0f766e]"
                              )}
                            >
                              {share.creditsUsed} used
                            </span>
                          </div>
                          <UsageBar used={share.creditsUsed} limit={share.creditLimit} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Credits shared with me (incoming) */}
                {receivedShares.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="size-4 text-muted-foreground" />
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Shared with me
                      </p>
                    </div>
                    <div className="space-y-3">
                      {receivedShares.map((share) => (
                        <div
                          key={share.id}
                          className="rounded-[22px] border border-foreground/8 bg-[#f8faf8] p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {share.ownerEmail ?? share.ownerName ?? "Credit owner"}
                              </p>
                              <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                owner-controlled · {share.status}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full border border-[#99f6e4] bg-[#ecfeff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0f766e]">
                              {share.creditsRemaining} left
                            </span>
                          </div>
                          <UsageBar used={share.creditsUsed} limit={share.creditLimit} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isFetching && !hasSharedActivity && !error && (
            <div className="rounded-[24px] border border-dashed border-foreground/12 bg-[#f8faf8] p-6 text-center">
              <p className="text-sm font-medium text-foreground">No shared credits yet</p>
              <p className="mt-1 text-sm leading-7 text-muted-foreground">
                Share credits with teammates from{" "}
                <Link href="/settings#shared-credits" className="text-[#0f766e] underline underline-offset-4">
                  Settings
                </Link>{" "}
                to track their usage here.
              </p>
            </div>
          )}

        </div>
      </section>

      <SiteFooter navItems={marketingFooterItems} />
    </main>
  )
}
