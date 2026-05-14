"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Mail,
  ShieldCheck,
  UsersRound,
} from "lucide-react"

import {
  marketingFooterItems,
  pricingNavItems,
} from "@/components/home/home-content"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"
import { buttonVariants } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { API_BASE_URL } from "@/lib/api"
import { cn } from "@/lib/utils"

type BillingInterval = "monthly" | "annual"

type CheckoutPlan = {
  key: string
  name: string
  badge: string
  description: string
  monthlyPrice: number
  monthlyPages: number
  annualPrice: number
  annualPages: number
  featured?: boolean
  highlights: string[]
}

const creditCostPerDocument = 2

const checkoutPlans: CheckoutPlan[] = [
  {
    key: "launch_room",
    name: "Launch Room",
    badge: "Starter volume",
    description: "For solo users and small recurring statement batches.",
    monthlyPrice: 12,
    monthlyPages: 200,
    annualPrice: 85,
    annualPages: 2400,
    highlights: [
      "Saved PDF history unlocks beyond the free 2-file limit",
      "CSV and XLSX export workflow",
      "Best for lighter monthly work",
    ],
  },
  {
    key: "ledger_pro",
    name: "Ledger Pro",
    badge: "Most balanced",
    description: "For repeat document processing and regular finance work.",
    monthlyPrice: 25,
    monthlyPages: 520,
    annualPrice: 170,
    annualPages: 6240,
    featured: true,
    highlights: [
      "More page credits for repeat use",
      "Credit sharing controls for invited emails",
      "Good fit for small teams and accountants",
    ],
  },
  {
    key: "batch_business",
    name: "Batch Business",
    badge: "High volume",
    description: "For larger queues and teams processing frequent batches.",
    monthlyPrice: 45,
    monthlyPages: 2250,
    annualPrice: 280,
    annualPages: 27000,
    highlights: [
      "Large monthly conversion room",
      "Credit sharing and member limits",
      "Built for ongoing operations",
    ],
  },
]

function getPlanPrice(plan: CheckoutPlan, interval: BillingInterval) {
  return interval === "annual" ? plan.annualPrice : plan.monthlyPrice
}

function getPlanPages(plan: CheckoutPlan, interval: BillingInterval) {
  return interval === "annual" ? plan.annualPages : plan.monthlyPages
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

export function PricingPage({
  checkoutStatus,
}: {
  checkoutStatus?: string | null
}) {
  const router = useRouter()
  const { user } = useAuth()
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("monthly")
  const [checkoutPlanKey, setCheckoutPlanKey] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  async function handleCheckout(plan: CheckoutPlan) {
    if (!user) {
      router.push("/login")
      return
    }

    setCheckoutError(null)
    setCheckoutPlanKey(plan.key)

    try {
      const response = await fetch(`${API_BASE_URL}/api/billing/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          planKey: plan.key,
          interval: billingInterval,
        }),
      })
      const data = await response.json().catch(() => null)

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (!response.ok || !data?.checkoutUrl) {
        throw new Error(data?.message || "Checkout could not be started")
      }

      window.location.assign(data.checkoutUrl)
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "Checkout could not be started"
      )
    } finally {
      setCheckoutPlanKey(null)
    }
  }

  return (
    <main className="bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-foreground/10 bg-[#f5f6ef]">
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-6 lg:px-8 lg:pb-20">
          <SiteHeader navItems={pricingNavItems} />

          <div className="pt-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
                  Pricing
                </p>
                <h1 className="mt-4 font-heading text-4xl font-semibold text-foreground sm:text-5xl">
                  Choose page credits for real statement volume.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
                  Plans include page credits. Processing a saved PDF currently
                  spends {creditCostPerDocument} credits, and paid accounts can
                  share owner-controlled credits with invited emails.
                </p>
              </div>

              <div className="rounded-[18px] border border-foreground/10 bg-white p-1 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.32)]">
                {(["monthly", "annual"] as const).map((interval) => (
                  <button
                    key={interval}
                    type="button"
                    onClick={() => setBillingInterval(interval)}
                    className={cn(
                      "rounded-[14px] px-5 py-3 text-sm font-medium capitalize transition-colors",
                      billingInterval === interval
                        ? "bg-[#12314d] text-white"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {interval}
                  </button>
                ))}
              </div>
            </div>

            {checkoutStatus === "cancelled" ? (
              <div className="mt-6 rounded-[20px] border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-sm text-[#92400e]">
                Checkout was cancelled. Your current plan was not changed.
              </div>
            ) : null}

            {checkoutError ? (
              <div className="mt-6 rounded-[20px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#991b1b]">
                {checkoutError}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-b border-foreground/10 bg-background">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <div className="grid gap-5 xl:grid-cols-4">
            {checkoutPlans.map((plan) => {
              const pages = getPlanPages(plan, billingInterval)
              const price = getPlanPrice(plan, billingInterval)
              const approximateDocuments = Math.floor(
                pages / creditCostPerDocument
              )

              return (
                <article
                  key={plan.key}
                  className={cn(
                    "flex min-h-[440px] flex-col rounded-[8px] border bg-white p-6 shadow-[0_24px_80px_-58px_rgba(15,23,42,0.35)]",
                    plan.featured
                      ? "border-[#0f766e] ring-2 ring-[#99f6e4]/70"
                      : "border-foreground/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                        {plan.badge}
                      </p>
                      <h2 className="mt-3 font-heading text-2xl font-semibold text-foreground">
                        {plan.name}
                      </h2>
                    </div>

                    {plan.featured ? (
                      <span className="rounded-full border border-[#99f6e4] bg-[#ecfeff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#0f766e]">
                        Popular
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-4 min-h-[52px] text-sm leading-7 text-muted-foreground">
                    {plan.description}
                  </p>

                  <div className="mt-6">
                    <div className="flex items-end gap-2">
                      <span className="font-heading text-4xl font-semibold text-foreground">
                        ${price}
                      </span>
                      <span className="pb-1 text-sm text-muted-foreground">
                        / {billingInterval === "annual" ? "year" : "month"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-medium text-foreground">
                      {formatNumber(pages)} page credits /{" "}
                      {billingInterval === "annual" ? "year" : "month"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Around {formatNumber(approximateDocuments)} saved PDFs at{" "}
                      {creditCostPerDocument} credits each.
                    </p>
                  </div>

                  <div className="mt-6 space-y-3">
                    {plan.highlights.map((highlight) => (
                      <div key={highlight} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-1 size-4 shrink-0 text-[#0f766e]" />
                        <p className="text-sm leading-7 text-foreground">
                          {highlight}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCheckout(plan)}
                    disabled={checkoutPlanKey === plan.key}
                    className={cn(
                      buttonVariants({
                        variant: plan.featured ? "default" : "outline",
                        size: "lg",
                      }),
                      "mt-auto w-full rounded-[8px] px-5 disabled:translate-y-0",
                      plan.featured &&
                        "bg-[linear-gradient(135deg,#12314d_0%,#0f766e_100%)] text-white hover:opacity-95"
                    )}
                  >
                    {checkoutPlanKey === plan.key ? "Opening Stripe..." : "Buy plan"}
                    <ArrowRight className="size-4" />
                  </button>
                </article>
              )
            })}

            <article className="flex min-h-[440px] flex-col rounded-[8px] border border-foreground/10 bg-[#f8faf8] p-6 shadow-[0_24px_80px_-58px_rgba(15,23,42,0.35)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                Custom volume
              </p>
              <h2 className="mt-3 font-heading text-2xl font-semibold text-foreground">
                Enterprise Desk
              </h2>
              <p className="mt-4 min-h-[52px] text-sm leading-7 text-muted-foreground">
                For teams needing higher page volume, rollout help, custom
                parsing, or API access.
              </p>

              <div className="mt-6">
                <p className="font-heading text-4xl font-semibold text-foreground">
                  Contact
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  We can shape a custom credit pool and document retention
                  policy for larger operations.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  "Custom page credit volume",
                  "Team access and credit ownership controls",
                  "Priority parsing and onboarding support",
                ].map((highlight) => (
                  <div key={highlight} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-[#0f766e]" />
                    <p className="text-sm leading-7 text-foreground">
                      {highlight}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "mt-auto w-full rounded-[8px] border-foreground/10 bg-white px-5"
                )}
              >
                Contact sales
                <Mail className="size-4" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="border-b border-foreground/10 bg-[#f7f8f3]">
        <div className="mx-auto grid max-w-7xl gap-5 px-6 py-12 lg:grid-cols-3 lg:px-8 lg:py-16">
          {[
            {
              icon: CreditCard,
              title: "Stripe checkout",
              text: "Paid plans open Stripe Checkout and return to the settings page after purchase.",
            },
            {
              icon: UsersRound,
              title: "Shared credits",
              text: "Paid owners can grant an email a controlled credit limit from the owner pool.",
            },
            {
              icon: ShieldCheck,
              title: "Personal credits stay personal",
              text: "Credits someone buys for themselves stay outside another owner control.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[8px] border border-foreground/10 bg-white p-6"
            >
              <span className="flex size-11 items-center justify-center rounded-[8px] bg-[#ecfeff] text-[#0f766e]">
                <item.icon className="size-5" />
              </span>
              <p className="mt-4 font-heading text-xl font-semibold text-foreground">
                {item.title}
              </p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <div className="flex flex-col gap-4 rounded-[8px] border border-foreground/10 bg-white p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-heading text-2xl font-semibold text-foreground">
                Already bought credits?
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Your active plan, remaining credits, saved documents, and shared
                credit controls live in settings.
              </p>
            </div>
            <Link
              href="/settings#subscription"
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-[8px] px-5"
              )}
            >
              Manage subscription
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter navItems={marketingFooterItems} />
    </main>
  )
}
