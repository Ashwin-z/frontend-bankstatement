"use client"

import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Bell,
  CreditCard,
  FolderOpen,
  History,
  Pencil,
  Rocket,
  Save,
  Settings,
  ShieldCheck,
  Share2,
  Trash2,
  UserPlus,
  UserRound,
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

type SavedDocumentRecord = {
  id: string
  originalName: string
  mimeType: string
  sizeBytes: number
  uploadSource: string
  createdAt: string
  downloadPath: string
}

type SettingsOverview = {
  subscription: {
    plan: "free" | "credits" | "growth" | "premium"
    status: "inactive" | "active" | "trialing" | "past_due" | "canceled"
    renewalAt: string | null
    hasPurchasedCredits: boolean
    lifetimeCreditsPurchased: number
    activePlanKey: string | null
    activePlanName: string | null
    activePlanInterval: "monthly" | "annual" | null
    activePlanCredits: number
    creditsPerDocument: number
    creditsBalance: number
    buyCreditsHref: string
    billingPortalAvailable: boolean
  }
  creditHistory: {
    windowDays: number
    entries: CreditHistoryEntry[]
    usageModelNote: string
  }
  savedDocuments: {
    retention: {
      keepsFullHistory: boolean
      limit: number | null
      totalSavedDocuments: number
      note: string
    }
    documents: SavedDocumentRecord[]
  }
  creditSharing: {
    canShareCredits: boolean
    received: CreditShareRecord[]
    managed: CreditShareRecord[]
  }
  preferences: {
    documentReadyEmails: boolean
    billingEmails: boolean
    productUpdates: boolean
    preferSharedCredits: boolean
  }
}

type CreditShareRecord = {
  id: string
  ownerId?: string
  ownerName?: string
  ownerEmail?: string | null
  recipientUserId?: string | null
  recipientName?: string | null
  recipientEmail: string
  creditLimit: number
  creditsUsed: number
  creditsRemaining: number
  status: "active" | "paused"
  createdAt?: string
  updatedAt?: string
}

function getUserInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Not scheduled"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Not scheduled"
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function prettyPlanLabel(plan: SettingsOverview["subscription"]["plan"]) {
  switch (plan) {
    case "premium":
      return "Premium"
    case "growth":
      return "Growth"
    case "credits":
      return "Credit pack"
    default:
      return "Free"
  }
}

function prettyStatusLabel(status: SettingsOverview["subscription"]["status"]) {
  switch (status) {
    case "active":
      return "Active"
    case "trialing":
      return "Trialing"
    case "past_due":
      return "Past due"
    case "canceled":
      return "Canceled"
    default:
      return "Inactive"
  }
}

export function SettingsPage() {
  const { user, isLoading, refreshUser } = useAuth()
  const router = useRouter()
  const [overview, setOverview] = useState<SettingsOverview | null>(null)
  const [isFetchingOverview, setIsFetchingOverview] = useState(true)
  const [overviewError, setOverviewError] = useState<string | null>(null)
  const [preferencesDraft, setPreferencesDraft] = useState<
    SettingsOverview["preferences"] | null
  >(null)
  const [isSavingPreferences, setIsSavingPreferences] = useState(false)
  const [preferencesMessage, setPreferencesMessage] = useState<string | null>(null)
  const [preferencesError, setPreferencesError] = useState<string | null>(null)
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null)
  const [isSyncingCheckout, setIsSyncingCheckout] = useState(false)
  const [shareEmail, setShareEmail] = useState("")
  const [shareLimit, setShareLimit] = useState("100")
  const [shareMessage, setShareMessage] = useState<string | null>(null)
  const [shareError, setShareError] = useState<string | null>(null)
  const [isSavingShare, setIsSavingShare] = useState(false)
  const [isOpeningPortal, setIsOpeningPortal] = useState(false)
  const [editingShareId, setEditingShareId] = useState<string | null>(null)
  const [editingLimit, setEditingLimit] = useState("")
  const [isDeletingShareId, setIsDeletingShareId] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [isLoading, router, user])

  useEffect(() => {
    if (!user) {
      return
    }

    let isMounted = true

    async function loadOverview() {
      setIsFetchingOverview(true)
      setOverviewError(null)

      try {
        const response = await fetch(`${API_BASE_URL}/api/account/settings`, {
          credentials: "include",
        })
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(data?.message || "Settings could not be loaded")
        }

        if (!isMounted) {
          return
        }

        setOverview(data as SettingsOverview)
        setPreferencesDraft((data as SettingsOverview).preferences)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setOverviewError(
          error instanceof Error ? error.message : "Settings could not be loaded"
        )
      } finally {
        if (isMounted) {
          setIsFetchingOverview(false)
        }
      }
    }

    void loadOverview()

    return () => {
      isMounted = false
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      return
    }

    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get("session_id")

    if (params.get("checkout") !== "success" || !sessionId) {
      return
    }

    let isMounted = true

    async function syncCheckout() {
      setIsSyncingCheckout(true)
      setOverviewError(null)

      try {
        const syncResponse = await fetch(
          `${API_BASE_URL}/api/billing/checkout-sessions/${sessionId}/sync`,
          {
            method: "POST",
            credentials: "include",
          }
        )
        const syncData = await syncResponse.json().catch(() => null)

        if (!syncResponse.ok) {
          throw new Error(syncData?.message || "Checkout could not be synced")
        }

        const overviewResponse = await fetch(
          `${API_BASE_URL}/api/account/settings`,
          {
            credentials: "include",
          }
        )
        const overviewData = await overviewResponse.json().catch(() => null)

        if (!overviewResponse.ok) {
          throw new Error(overviewData?.message || "Settings could not be loaded")
        }

        if (!isMounted) {
          return
        }

        setOverview(overviewData as SettingsOverview)
        setPreferencesDraft((overviewData as SettingsOverview).preferences)
        setCheckoutMessage("Stripe purchase synced. Your plan and credits are updated.")
        window.history.replaceState(null, "", "/settings#subscription")
        await refreshUser()
      } catch (error) {
        if (!isMounted) {
          return
        }

        setOverviewError(
          error instanceof Error ? error.message : "Checkout could not be synced"
        )
      } finally {
        if (isMounted) {
          setIsSyncingCheckout(false)
        }
      }
    }

    void syncCheckout()

    return () => {
      isMounted = false
    }
  }, [refreshUser, user])

  const preferenceRows = useMemo(
    () => [
      {
        key: "documentReadyEmails" as const,
        title: "Document-ready alerts",
        description:
          "Email me when saved statement batches are ready to review or download.",
      },
      {
        key: "billingEmails" as const,
        title: "Billing and credit receipts",
        description:
          "Receive purchase confirmations, renewal receipts, and credit balance notices.",
      },
      {
        key: "productUpdates" as const,
        title: "Product updates",
        description:
          "Send occasional platform changes, new workflow features, and rollout notes.",
      },
      {
        key: "preferSharedCredits" as const,
        title: "Use shared credits first",
        description:
          "When enabled, credits shared with you by a team member are spent before your personal balance. Falls back to personal credits when the shared pool runs out.",
      },
    ],
    []
  )

  async function handlePreferenceToggle(
    key: keyof SettingsOverview["preferences"],
    event: ChangeEvent<HTMLInputElement>
  ) {
    setPreferencesDraft((current) => ({
      ...(current ?? {
        documentReadyEmails: true,
        billingEmails: true,
        productUpdates: false,
        preferSharedCredits: false,
      }),
      [key]: event.target.checked,
    }))
  }

  async function handlePreferenceSave() {
    if (!preferencesDraft) {
      return
    }

    setPreferencesMessage(null)
    setPreferencesError(null)
    setIsSavingPreferences(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/account/preferences`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(preferencesDraft),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message || "Settings update failed")
      }

      setPreferencesDraft(data.preferences)
      setOverview((currentOverview) =>
        currentOverview
          ? {
              ...currentOverview,
              preferences: data.preferences,
            }
          : currentOverview
      )
      setPreferencesMessage("Notification settings updated")
      await refreshUser()
    } catch (error) {
      setPreferencesError(
        error instanceof Error ? error.message : "Settings update failed"
      )
    } finally {
      setIsSavingPreferences(false)
    }
  }

  async function refreshSettingsOverview() {
    const response = await fetch(`${API_BASE_URL}/api/account/settings`, {
      credentials: "include",
    })
    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(data?.message || "Settings could not be loaded")
    }

    setOverview(data as SettingsOverview)
    setPreferencesDraft((data as SettingsOverview).preferences)
    await refreshUser()
  }

  async function handleShareSave() {
    setShareMessage(null)
    setShareError(null)
    setIsSavingShare(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/account/credit-shares`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          recipientEmail: shareEmail,
          creditLimit: Number(shareLimit),
          status: "active",
        }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message || "Credit share could not be saved")
      }

      setShareEmail("")
      setShareLimit("100")
      setShareMessage("Shared credit limit saved")
      await refreshSettingsOverview()
    } catch (error) {
      setShareError(
        error instanceof Error ? error.message : "Credit share could not be saved"
      )
    } finally {
      setIsSavingShare(false)
    }
  }

  async function handleShareEdit(recipientEmail: string) {
    setShareMessage(null)
    setShareError(null)
    setIsSavingShare(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/account/credit-shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          recipientEmail,
          creditLimit: Number(editingLimit),
          status: "active",
        }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message || "Credit limit could not be updated")
      }

      setEditingShareId(null)
      setShareMessage("Credit limit updated")
      await refreshSettingsOverview()
    } catch (error) {
      setShareError(
        error instanceof Error ? error.message : "Credit limit could not be updated"
      )
    } finally {
      setIsSavingShare(false)
    }
  }

  async function handleShareDelete(shareId: string) {
    setShareMessage(null)
    setShareError(null)
    setIsDeletingShareId(shareId)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/account/credit-shares/${shareId}`,
        { method: "DELETE", credentials: "include" }
      )
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message || "Credit share could not be removed")
      }

      setShareMessage("Credit share removed")
      await refreshSettingsOverview()
    } catch (error) {
      setShareError(
        error instanceof Error ? error.message : "Credit share could not be removed"
      )
    } finally {
      setIsDeletingShareId(null)
    }
  }

  async function handlePortalOpen() {
    setIsOpeningPortal(true)
    setOverviewError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/billing/portal`, {
        method: "POST",
        credentials: "include",
      })
      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.portalUrl) {
        throw new Error(data?.message || "Billing portal could not be opened")
      }

      window.location.href = data.portalUrl
    } catch (error) {
      setOverviewError(
        error instanceof Error ? error.message : "Billing portal could not be opened"
      )
    } finally {
      setIsOpeningPortal(false)
    }
  }

  if (isLoading || !user) {
    return (
      <main className="bg-background text-foreground">
        <section className="min-h-screen bg-[#f5f6ef]">
          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
            <div className="h-16 rounded-full border border-white/80 bg-white/80" />
            <div className="mt-10 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
              <div className="h-80 rounded-[32px] border border-white/80 bg-white/80" />
              <div className="h-[760px] rounded-[32px] border border-white/80 bg-white/80" />
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-foreground/10 bg-[#f5f6ef]">
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="pointer-events-none absolute -left-16 top-10 h-[320px] w-[320px] rounded-full bg-[#99f6e4]/22 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-[320px] w-[320px] rounded-full bg-[#bfdbfe]/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-6 lg:px-8 lg:pb-24">
          <SiteHeader navItems={homeNavItems} />

          <div className="mt-10 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="rounded-[34px] border border-white/85 bg-white/90 p-6 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.38)] backdrop-blur">
              <div className="flex flex-col items-center text-center">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    width={112}
                    height={112}
                    className="size-28 rounded-full object-cover ring-4 ring-white shadow-[0_20px_40px_-30px_rgba(15,23,42,0.45)]"
                  />
                ) : (
                  <span className="flex size-28 items-center justify-center rounded-full bg-[linear-gradient(135deg,#12314d_0%,#0f766e_100%)] text-3xl font-semibold text-white shadow-[0_22px_48px_-30px_rgba(15,118,110,0.75)]">
                    {getUserInitials(user.name)}
                  </span>
                )}

                <p className="mt-5 font-heading text-2xl font-semibold tracking-tight text-foreground">
                  {user.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <span className="rounded-full border border-[#99f6e4] bg-[#ecfeff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#0f766e]">
                    {overview?.subscription.creditsBalance ?? user.credits} credits
                  </span>
                  <span className="rounded-full border border-foreground/10 bg-[#f8faf8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {overview ? prettyPlanLabel(overview.subscription.plan) : "Free"}
                  </span>
                </div>

                <Link
                  href="/pricing"
                  className="mt-4 text-sm font-medium text-[#0f766e] underline underline-offset-4 transition-colors hover:text-[#12314d]"
                >
                  Buy credits or upgrade
                </Link>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  {
                    icon: CreditCard,
                    label: "Subscription status",
                    value: overview
                      ? prettyStatusLabel(overview.subscription.status)
                      : "Loading",
                  },
                  {
                    icon: Rocket,
                    label: "Purchased credits",
                    value: overview
                      ? String(overview.subscription.lifetimeCreditsPurchased)
                      : "0",
                  },
                  {
                    icon: FolderOpen,
                    label: "Saved documents",
                    value: overview
                      ? String(overview.savedDocuments.retention.totalSavedDocuments)
                      : "0",
                  },
                  {
                    icon: ShieldCheck,
                    label: "Retention rule",
                    value: overview?.savedDocuments.retention.keepsFullHistory
                      ? "Full history saved"
                      : "Latest 2 PDFs kept",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[22px] border border-foreground/8 bg-[#f8faf8] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-2xl bg-white text-[#0f766e] ring-1 ring-foreground/8">
                        <item.icon className="size-4" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2">
                <Link
                  href="/profile"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "w-full rounded-full border-foreground/10 bg-white"
                  )}
                >
                  <UserRound className="size-4" />
                  Profile
                  <ArrowRight className="ml-auto size-4" />
                </Link>
                <Link
                  href="/documents"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "w-full rounded-full border-foreground/10 bg-white"
                  )}
                >
                  <FolderOpen className="size-4" />
                  PDF library
                  <ArrowRight className="ml-auto size-4" />
                </Link>
                <Link
                  href="/credits"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "w-full rounded-full border-foreground/10 bg-white"
                  )}
                >
                  <History className="size-4" />
                  Credit history
                  <ArrowRight className="ml-auto size-4" />
                </Link>
              </div>

            </aside>

            <div className="space-y-6">
              <section className="rounded-[34px] border border-white/85 bg-white/90 p-6 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.38)] backdrop-blur sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
                      Settings
                    </p>
                    <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
                      Billing, retention, and account controls
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                      Manage the pieces that matter before payment flows go live:
                      credit balance, subscription state, saved document rules,
                      and notification preferences.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/profile"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "rounded-full border-foreground/10 bg-white px-5"
                      )}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/pricing"
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "rounded-full px-5 shadow-[0_18px_40px_-28px_rgba(15,118,110,0.8)]"
                      )}
                    >
                      Buy credits
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>

                {overviewError ? (
                  <div className="mt-5 rounded-[20px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#991b1b]">
                    {overviewError}
                  </div>
                ) : null}

                {isSyncingCheckout ? (
                  <div className="mt-5 rounded-[20px] border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-sm text-[#1d4ed8]">
                    Syncing Stripe checkout with your account...
                  </div>
                ) : null}

                {checkoutMessage ? (
                  <div className="mt-5 rounded-[20px] border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]">
                    {checkoutMessage}
                  </div>
                ) : null}

                {isFetchingOverview && !overview ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-32 rounded-[24px] border border-foreground/8 bg-[#f8faf8]"
                      />
                    ))}
                  </div>
                ) : overview ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {[
                      {
                        icon: CreditCard,
                        label: "Current balance",
                        value: `${overview.subscription.creditsBalance} credits`,
                        note: `Personal balance. Each saved PDF spends ${overview.subscription.creditsPerDocument} credits.`,
                      },
                      {
                        icon: Rocket,
                        label: "Plan status",
                        value: `${prettyPlanLabel(overview.subscription.plan)} / ${prettyStatusLabel(overview.subscription.status)}`,
                        note: overview.subscription.activePlanName
                          ? `${overview.subscription.activePlanName} ${overview.subscription.activePlanInterval ?? ""} plan`
                          : "No paid plan is active yet",
                      },
                      {
                        icon: FolderOpen,
                        label: "Saved PDF policy",
                        value: overview.savedDocuments.retention.keepsFullHistory
                          ? "Full history"
                          : "Latest 2 documents",
                        note: overview.savedDocuments.retention.note,
                      },
                    ].map((card) => (
                      <div
                        key={card.label}
                        className="rounded-[24px] border border-foreground/8 bg-[#f8faf8] p-5"
                      >
                        <span className="flex size-11 items-center justify-center rounded-2xl bg-white text-[#0f766e] ring-1 ring-foreground/8">
                          <card.icon className="size-5" />
                        </span>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {card.label}
                        </p>
                        <p className="mt-2 font-heading text-xl font-semibold tracking-tight text-foreground">
                          {card.value}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                          {card.note}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>

              {overview ? (
                <section
                  id="subscription"
                  className="rounded-[34px] border border-white/85 bg-white/90 p-6 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.38)] backdrop-blur sm:p-8"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
                        Subscription
                      </p>
                      <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
                        Manage plan and credit access
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                        Stripe-backed plans update this area after checkout.
                        Your personal credits stay yours, and any credits you
                        share with another email remain owner-controlled.
                      </p>
                    </div>

                    <span className="flex size-12 items-center justify-center rounded-2xl bg-[#ecfeff] text-[#0f766e]">
                      <Settings className="size-5" />
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.88fr)]">
                    <div className="rounded-[28px] border border-foreground/8 bg-[#f8faf8] p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Account plan
                          </p>
                          <p className="mt-2 font-heading text-3xl font-semibold tracking-tight text-foreground">
                            {overview.subscription.activePlanName ??
                              prettyPlanLabel(overview.subscription.plan)}
                          </p>
                        </div>
                        <span className="rounded-full border border-[#99f6e4] bg-[#ecfeff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#0f766e]">
                          {prettyStatusLabel(overview.subscription.status)}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[22px] border border-white/90 bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Plan credits
                          </p>
                          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                            {overview.subscription.activePlanCredits || 0}
                          </p>
                        </div>
                        <div className="rounded-[22px] border border-white/90 bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Renewal / billing date
                          </p>
                          <p className="mt-2 text-base font-medium text-foreground">
                            {formatDate(overview.subscription.renewalAt)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 rounded-[24px] border border-[#bfdbfe] bg-[#eff6ff] p-4 text-sm leading-7 text-[#1d4ed8]">
                        {overview.savedDocuments.retention.note} Paid owners can
                        also invite emails and set controlled credit limits from
                        their own purchased pool.
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-foreground/8 bg-[#f8faf8] p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Billing actions
                      </p>
                      <p className="mt-3 font-heading text-xl font-semibold tracking-tight text-foreground">
                        Buy credits or manage Stripe.
                      </p>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        Checkout activates a plan and grants credits. The Stripe
                        portal handles cards, invoices, and subscription changes
                        once a customer record exists.
                      </p>
                      <div className="mt-6 space-y-3">
                        <Link
                          href={overview.subscription.buyCreditsHref}
                          className={cn(
                            buttonVariants({ size: "lg" }),
                            "w-full rounded-full px-5 shadow-[0_18px_40px_-28px_rgba(15,118,110,0.8)]"
                          )}
                        >
                          Buy credits
                          <ArrowRight className="size-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={handlePortalOpen}
                          disabled={
                            isOpeningPortal ||
                            !overview.subscription.billingPortalAvailable
                          }
                          className={cn(
                            buttonVariants({ variant: "outline", size: "lg" }),
                            "w-full rounded-full border-foreground/10 bg-white px-5 disabled:translate-y-0 disabled:opacity-50"
                          )}
                        >
                          {isOpeningPortal ? "Opening..." : "Stripe portal"}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}

              {overview ? (
                <section className="rounded-[34px] border border-white/85 bg-white/90 p-6 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.38)] backdrop-blur sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
                        Shared credits
                      </p>
                      <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
                        Invite emails and set limits
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                        Paid credit owners can share part of their premium pool
                        by email. If that person already has personal credits,
                        those stay separate from the owner-controlled allowance.
                      </p>
                    </div>

                    <span className="flex size-12 items-center justify-center rounded-2xl bg-[#ecfeff] text-[#0f766e]">
                      <Share2 className="size-5" />
                    </span>
                  </div>

                  {!overview.creditSharing.canShareCredits ? (
                    <div className="mt-5 rounded-[22px] border border-[#fde68a] bg-[#fffbeb] px-4 py-4 text-sm leading-7 text-[#92400e]">
                      Credit sharing unlocks after this account buys a paid
                      credit plan.
                    </div>
                  ) : (() => {
                    const alreadyAllocated = overview.creditSharing.managed.reduce(
                      (sum, s) => sum + s.creditLimit,
                      0
                    )
                    const availableToShare = Math.max(
                      0,
                      overview.subscription.creditsBalance - alreadyAllocated
                    )
                    return (
                      <>
                        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-[22px] border border-foreground/8 bg-[#f8faf8] px-4 py-3 text-sm">
                          <span className="text-muted-foreground">Your balance:</span>
                          <span className="font-semibold text-foreground">
                            {overview.subscription.creditsBalance} credits
                          </span>
                          <span className="text-foreground/20">·</span>
                          <span className="text-muted-foreground">Already allocated:</span>
                          <span className="font-semibold text-foreground">
                            {alreadyAllocated}
                          </span>
                          <span className="text-foreground/20">·</span>
                          <span className="text-muted-foreground">Available to share:</span>
                          <span
                            className={cn(
                              "font-semibold",
                              availableToShare === 0
                                ? "text-red-500"
                                : "text-[#0f766e]"
                            )}
                          >
                            {availableToShare}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-foreground">
                              Recipient email
                            </span>
                            <input
                              type="email"
                              value={shareEmail}
                              onChange={(event) => setShareEmail(event.target.value)}
                              placeholder="teammate@example.com"
                              className="h-12 w-full rounded-2xl border border-foreground/10 bg-white px-4 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            />
                          </label>

                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-foreground">
                              Credit limit{" "}
                              <span className="font-normal text-muted-foreground">
                                (max {availableToShare})
                              </span>
                            </span>
                            <input
                              type="number"
                              min={1}
                              max={availableToShare}
                              value={shareLimit}
                              onChange={(event) => setShareLimit(event.target.value)}
                              className="h-12 w-full rounded-2xl border border-foreground/10 bg-white px-4 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                            />
                          </label>

                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={handleShareSave}
                              disabled={isSavingShare || availableToShare === 0}
                              className={cn(
                                buttonVariants({ size: "lg" }),
                                "h-12 rounded-full px-5 disabled:translate-y-0"
                              )}
                            >
                              {isSavingShare ? "Saving..." : "Add email"}
                              <UserPlus className="size-4" />
                            </button>
                          </div>
                        </div>
                      </>
                    )
                  })()}

                  {shareMessage ? (
                    <div className="mt-5 rounded-[20px] border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]">
                      {shareMessage}
                    </div>
                  ) : null}

                  {shareError ? (
                    <div className="mt-5 rounded-[20px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#991b1b]">
                      {shareError}
                    </div>
                  ) : null}

                  <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Credits I manage
                      </p>
                      <div className="mt-3 space-y-3">
                        {overview.creditSharing.managed.length > 0 ? (
                          overview.creditSharing.managed.map((share) => (
                            <div
                              key={share.id}
                              className="rounded-[22px] border border-foreground/8 bg-[#f8faf8] p-4"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-foreground">
                                    {share.recipientEmail}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="uppercase tracking-[0.14em]">
                                      {share.status}
                                    </span>
                                    <span>·</span>
                                    <span>
                                      {share.creditsRemaining} of{" "}
                                      {share.creditLimit} left
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    title="Edit limit"
                                    onClick={() => {
                                      setEditingShareId(share.id)
                                      setEditingLimit(String(share.creditLimit))
                                    }}
                                    className="flex size-8 items-center justify-center rounded-full border border-foreground/10 bg-white text-muted-foreground transition-colors hover:border-[#0f766e] hover:text-[#0f766e]"
                                  >
                                    <Pencil className="size-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    title="Remove"
                                    disabled={isDeletingShareId === share.id}
                                    onClick={() => handleShareDelete(share.id)}
                                    className="flex size-8 items-center justify-center rounded-full border border-foreground/10 bg-white text-muted-foreground transition-colors hover:border-red-300 hover:text-red-500 disabled:opacity-50"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                              </div>

                              {editingShareId === share.id ? (
                                <div className="mt-3 flex items-center gap-2">
                                  <input
                                    type="number"
                                    min={1}
                                    value={editingLimit}
                                    onChange={(e) =>
                                      setEditingLimit(e.target.value)
                                    }
                                    placeholder="New limit"
                                    className="h-9 w-28 rounded-xl border border-foreground/10 bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                                  />
                                  <button
                                    type="button"
                                    disabled={isSavingShare}
                                    onClick={() =>
                                      handleShareEdit(share.recipientEmail)
                                    }
                                    className={cn(
                                      buttonVariants({ size: "sm" }),
                                      "rounded-full px-4 disabled:translate-y-0"
                                    )}
                                  >
                                    {isSavingShare ? "Saving..." : "Save"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingShareId(null)}
                                    className={cn(
                                      buttonVariants({
                                        variant: "outline",
                                        size: "sm",
                                      }),
                                      "rounded-full border-foreground/10 bg-white px-4"
                                    )}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          ))
                        ) : (
                          <div className="rounded-[22px] border border-dashed border-foreground/12 bg-[#f8faf8] p-4 text-sm leading-7 text-muted-foreground">
                            No shared-credit emails have been added yet.
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Credits shared with me
                      </p>
                      <div className="mt-3 space-y-3">
                        {overview.creditSharing.received.length > 0 ? (
                          overview.creditSharing.received.map((share) => (
                            <div
                              key={share.id}
                              className="rounded-[22px] border border-foreground/8 bg-[#f8faf8] p-4"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {share.ownerEmail ?? share.ownerName}
                                  </p>
                                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                    owner controlled
                                  </p>
                                </div>
                                <span className="rounded-full border border-[#99f6e4] bg-[#ecfeff] px-3 py-1 text-xs font-medium text-[#0f766e]">
                                  {share.creditsRemaining} available
                                </span>
                              </div>
                              <p className="mt-3 text-sm text-muted-foreground">
                                Personal credits are used first, then shared
                                premium credits can cover the rest.
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-[22px] border border-dashed border-foreground/12 bg-[#f8faf8] p-4 text-sm leading-7 text-muted-foreground">
                            No one has shared credits with this account yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}

              {overview ? (
                <section className="rounded-[34px] border border-white/85 bg-white/90 p-6 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.38)] backdrop-blur sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
                        Preferences
                      </p>
                      <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
                        Important account settings
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                        Keep the settings that matter close to billing and saved
                        documents: alerts, receipts, and product notices.
                      </p>
                    </div>

                    <span className="flex size-12 items-center justify-center rounded-2xl bg-[#ecfeff] text-[#0f766e]">
                      <Bell className="size-5" />
                    </span>
                  </div>

                  {preferencesMessage ? (
                    <div className="mt-5 rounded-[20px] border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]">
                      {preferencesMessage}
                    </div>
                  ) : null}

                  {preferencesError ? (
                    <div className="mt-5 rounded-[20px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#991b1b]">
                      {preferencesError}
                    </div>
                  ) : null}

                  <div className="mt-6 space-y-3">
                    {preferenceRows.map((item) => (
                      <label
                        key={item.key}
                        className="flex cursor-pointer items-start justify-between gap-4 rounded-[24px] border border-foreground/8 bg-[#f8faf8] p-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm leading-7 text-muted-foreground">
                            {item.description}
                          </p>
                        </div>

                        <input
                          type="checkbox"
                          checked={Boolean(preferencesDraft?.[item.key])}
                          onChange={(event) => handlePreferenceToggle(item.key, event)}
                          className="mt-1 size-5 rounded border-foreground/20 accent-[#0f766e]"
                        />
                      </label>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <Link
                      href="/profile#settings"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "rounded-full border-foreground/10 bg-white px-5"
                      )}
                    >
                      Password and security
                    </Link>

                    <button
                      type="button"
                      onClick={handlePreferenceSave}
                      disabled={isSavingPreferences || !preferencesDraft}
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "rounded-full px-5 shadow-[0_18px_40px_-28px_rgba(15,118,110,0.8)] disabled:translate-y-0"
                      )}
                    >
                      {isSavingPreferences ? "Saving..." : "Save settings"}
                      <Save className="size-4" />
                    </button>
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter navItems={marketingFooterItems} />
    </main>
  )
}
