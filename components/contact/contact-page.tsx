"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  Send,
  Building2,
  Users,
} from "lucide-react"

import {
  marketingFooterItems,
  pricingNavItems,
} from "@/components/home/home-content"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { API_BASE_URL } from "@/lib/api"
import { cn } from "@/lib/utils"

const contactNavItems = [
  ...pricingNavItems.filter((i) => i.href !== "/pricing"),
  { href: "/pricing", label: "Pricing" },
]

type FormState = {
  name: string
  email: string
  company: string
  phone: string
  teamSize: string
  message: string
}

const TEAM_SIZES = [
  { value: "", label: "Select team size" },
  { value: "1", label: "Just me" },
  { value: "2-10", label: "2 – 10 people" },
  { value: "11-50", label: "11 – 50 people" },
  { value: "51-200", label: "51 – 200 people" },
  { value: "201+", label: "201+ people" },
]

const contactDetails = [
  {
    icon: Mail,
    label: "Email us",
    value: "support@bankstatementconvertor.com",
    href: "mailto:support@bankstatementconvertor.com",
  },
]

const enterpriseHighlights = [
  "Custom page credit volume",
  "Priority parsing and onboarding support",
  "Team access and credit ownership controls",
  "Dedicated account contact",
  "Custom document retention policy",
  "API access for automated pipelines",
]

export function ContactPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    company: "",
    phone: "",
    teamSize: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Name, email, and message are required.")
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "contact_page" }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.message || "Could not send your message. Please try again.")
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="bg-background text-foreground">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-foreground/10 bg-[#f5f6ef]">
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-6 lg:px-8 lg:pb-20">
          <SiteHeader navItems={contactNavItems} />
          <div className="pt-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
              Enterprise sales
            </p>
            <h1 className="mt-4 font-heading text-4xl font-semibold text-foreground sm:text-5xl">
              Let&apos;s build the right plan for your team.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
              Tell us about your document volume and workflow. We&apos;ll shape a
              custom credit pool, retention policy, and onboarding plan that fits
              your operation.
            </p>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="border-b border-foreground/10 bg-background">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px]">

            {/* Form */}
            <div>
              {submitted ? (
                <div className="flex flex-col items-start gap-4 rounded-[12px] border border-[#99f6e4] bg-[#ecfeff] px-6 py-8">
                  <span className="flex size-12 items-center justify-center rounded-full bg-[#0f766e]/10">
                    <CheckCircle2 className="size-6 text-[#0f766e]" />
                  </span>
                  <div>
                    <p className="font-heading text-xl font-semibold text-foreground">
                      Message received!
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      We&apos;ll review your inquiry and get back to you at{" "}
                      <strong>{form.email}</strong> within one business day.
                    </p>
                  </div>
                  <Link
                    href="/pricing"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "rounded-[8px]"
                    )}
                  >
                    Back to pricing
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium text-foreground"
                      >
                        Full name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Jane Smith"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="rounded-[8px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-foreground"
                      >
                        Work email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="jane@company.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="rounded-[8px]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="company"
                        className="text-sm font-medium text-foreground"
                      >
                        Company
                      </label>
                      <div className="relative">
                        <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="company"
                          name="company"
                          type="text"
                          placeholder="Acme Corp"
                          value={form.company}
                          onChange={handleChange}
                          className="rounded-[8px] pl-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="phone"
                        className="text-sm font-medium text-foreground"
                      >
                        Phone
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={form.phone}
                        onChange={handleChange}
                        className="rounded-[8px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="teamSize"
                      className="flex items-center gap-2 text-sm font-medium text-foreground"
                    >
                      <Users className="size-4 text-muted-foreground" />
                      Team size
                    </label>
                    <select
                      id="teamSize"
                      name="teamSize"
                      value={form.teamSize}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-[8px] border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40 focus:border-[#0f766e]"
                    >
                      {TEAM_SIZES.map((s) => (
                        <option key={s.value} value={s.value} disabled={s.value === ""}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium text-foreground"
                    >
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder="Tell us about your monthly document volume, current workflow, and anything specific you need from an enterprise plan."
                      value={form.message}
                      onChange={handleChange}
                      required
                      maxLength={2000}
                      className="flex w-full rounded-[8px] border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40 focus:border-[#0f766e] resize-none"
                    />
                    <p className="text-right text-xs text-muted-foreground">
                      {form.message.length} / 2000
                    </p>
                  </div>

                  {error ? (
                    <div className="rounded-[8px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#991b1b]">
                      {error}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitting}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "w-full rounded-[8px] bg-[linear-gradient(135deg,#12314d_0%,#0f766e_100%)] text-white hover:opacity-95 disabled:translate-y-0"
                    )}
                  >
                    {submitting ? "Sending..." : "Send message"}
                    <Send className="size-4" />
                  </button>

                  <p className="text-center text-xs text-muted-foreground">
                    We typically respond within one business day.
                  </p>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Enterprise features */}
              <div className="rounded-[8px] border border-foreground/10 bg-[#f8faf8] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Enterprise Desk
                </p>
                <p className="mt-3 font-heading text-xl font-semibold text-foreground">
                  What&apos;s included
                </p>
                <div className="mt-4 space-y-3">
                  {enterpriseHighlights.map((h) => (
                    <div key={h} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0f766e]" />
                      <p className="text-sm leading-6 text-foreground">{h}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact details */}
              <div className="rounded-[8px] border border-foreground/10 bg-white p-6">
                <p className="text-sm font-semibold text-foreground">
                  Prefer to reach out directly?
                </p>
                <div className="mt-4 space-y-4">
                  {contactDetails.map((c) => (
                    <a
                      key={c.href}
                      href={c.href}
                      className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-[#ecfeff] text-[#0f766e]">
                        <c.icon className="size-4" />
                      </span>
                      <div>
                        <p className="text-xs text-muted-foreground">{c.label}</p>
                        <p className="font-medium text-foreground">{c.value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Back to pricing */}
              <Link
                href="/pricing"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "rounded-[8px] text-muted-foreground"
                )}
              >
                View standard plans instead
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter navItems={marketingFooterItems} />
    </main>
  )
}
