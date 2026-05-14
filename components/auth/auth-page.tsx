"use client"

import Link from "next/link"
import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  FileSpreadsheet,
  LockKeyhole,
  MailCheck,
  ShieldCheck,
  Sparkles,
  UserRoundPlus,
  Workflow,
} from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import {
  homeNavItems,
  marketingFooterItems,
} from "@/components/home/home-content"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { API_BASE_URL } from "@/lib/api"
import { cn } from "@/lib/utils"

type AuthPageProps = {
  mode: "login" | "register"
  authError?: string | null
}

type AuthHighlight = {
  icon: LucideIcon
  title: string
  description: string
}

type AuthMetric = {
  label: string
  value: string
  tone?: "default" | "success"
}

type AuthContent = {
  eyebrow: string
  title: string
  description: string
  heroBadge: string
  previewEyebrow: string
  previewTitle: string
  previewDescription: string
  previewBullets: string[]
  metrics: AuthMetric[]
  highlights: AuthHighlight[]
  formEyebrow: string
  formTitle: string
  formDescription: string
  googleLabel: string
  helperText: string
  helperActionLabel: string
  helperActionHref: string
  submitLabel: string
  infoBadge: string
  infoTitle: string
  infoDescription: string
  prompt: string
  promptActionLabel: string
  promptActionHref: string
  footerNote: string
  headerActions: {
    href: string
    label: string
    variant?: "default" | "outline" | "ghost"
  }[]
}

type PasswordStrength = {
  score: number
  label: string
  description: string
}

const authContent: Record<AuthPageProps["mode"], AuthContent> = {
  login: {
    eyebrow: "Secure login",
    title: "Sign in to the workspace where queued statements and exports stay organized.",
    description:
      "This version of the auth screen feels like part of the product, not a disconnected form. It is built for people returning to live jobs, review flags, and export packages.",
    heroBadge: "Queue-aware access",
    previewEyebrow: "Workspace return",
    previewTitle: "Pick up active jobs without losing context.",
    previewDescription:
      "The login surface now connects directly to the real session layer. Users can sign in with email/password today, and Google sign-in is already structured for the moment you add the OAuth credentials.",
    previewBullets: [
      "Saved job status and operator review history in one room",
      "Spreadsheet exports stay attached to the originating batch",
      "A premium handoff from marketing pages into product access",
    ],
    metrics: [
      { label: "Active queues", value: "03" },
      { label: "Review lines", value: "02" },
      { label: "Export ready", value: "01", tone: "success" },
    ],
    highlights: [
      {
        icon: LockKeyhole,
        title: "Protected workspace entry",
        description:
          "Email and Google sign-in both point toward the same account-based workspace.",
      },
      {
        icon: FileSpreadsheet,
        title: "Saved exports stay visible",
        description:
          "Users come back to downloads, parsed rows, and file lineage without guessing.",
      },
      {
        icon: Workflow,
        title: "Built for repeat review",
        description:
          "A returning-user flow now matches the queue-driven product story from the homepage.",
      },
    ],
    formEyebrow: "Welcome back",
    formTitle: "Sign in to your workspace",
    formDescription:
      "Use Google or your email to reopen your control room.",
    googleLabel: "Continue with Google",
    helperText: "Keep me signed in on this device",
    helperActionLabel: "Need an account?",
    helperActionHref: "/register",
    submitLabel: "Sign in to workspace",
    infoBadge: "Operator ready",
    infoTitle: "Jobs, flags, and exports remain in one visible workflow.",
    infoDescription:
      "Email/password auth is live. Google sign-in is structurally ready and only needs your Google OAuth client credentials.",
    prompt: "New here?",
    promptActionLabel: "Create a free account",
    promptActionHref: "/register",
    footerNote:
      "Shared SaaS styling keeps auth, pricing, upload, and dashboard pages aligned.",
    headerActions: [
      {
        href: "/register",
        label: "Register",
        variant: "default",
      },
    ],
  },
  register: {
    eyebrow: "Free workspace",
    title: "Create an account and unlock a larger daily conversion room for repeat uploads.",
    description:
      "The register page should feel like the natural next step after testing the upload flow. It now frames the move from guest usage into a cleaner recurring workspace.",
    heroBadge: "8 pages every 24 hours",
    previewEyebrow: "Registered tier",
    previewTitle: "A smoother path from first test to repeat operations.",
    previewDescription:
      "This design turns registration into a value surface, not a dead-end form. It explains why creating an account matters: more daily pages, better repeat use, and room for saved jobs.",
    previewBullets: [
      "Higher daily page allowance than guest usage",
      "A cleaner base for saved jobs, exports, and review tools",
      "An easy upgrade bridge into paid plans later",
    ],
    metrics: [
      { label: "Daily pages", value: "08", tone: "success" },
      { label: "CSV + XLSX", value: "On" },
      { label: "Account setup", value: "Free" },
    ],
    highlights: [
      {
        icon: UserRoundPlus,
        title: "Register once, reuse often",
        description:
          "Repeat users get a cleaner home for new uploads, job history, and exports.",
      },
      {
        icon: Clock3,
        title: "Bigger daily room",
        description:
          "Registered accounts are positioned around the 8-pages-per-24-hours allowance.",
      },
      {
        icon: MailCheck,
        title: "Google or email onboarding",
        description:
          "Both entry points are presented clearly so the upgrade path feels obvious.",
      },
    ],
    formEyebrow: "Create account",
    formTitle: "Start your free workspace",
    formDescription:
      "Register with Google or your email to claim the larger daily limit.",
    googleLabel: "Register with Google",
    helperText: "I agree to the terms, privacy policy, and workspace usage rules",
    helperActionLabel: "Already registered?",
    helperActionHref: "/login",
    submitLabel: "Create free account",
    infoBadge: "Registered access",
    infoTitle: "8 pages every 24 hours with a cleaner repeat-use workflow.",
    infoDescription:
      "New users are now saved in MongoDB with a real session cookie. Google signup is structurally ready for your client ID and secret.",
    prompt: "Already have an account?",
    promptActionLabel: "Login instead",
    promptActionHref: "/login",
    footerNote:
      "The layout is ready for billing, team invites, and account onboarding steps later.",
    headerActions: [
      {
        href: "/login",
        label: "Login",
        variant: "outline",
      },
    ],
  },
}

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
    >
      <path
        d="M21.8 12.23c0-.76-.07-1.49-.2-2.2H12v4.16h5.49a4.7 4.7 0 0 1-2.04 3.08v2.55h3.3c1.93-1.78 3.05-4.41 3.05-7.59Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.07-.91 6.76-2.46l-3.3-2.55c-.92.62-2.08 1-3.46 1-2.65 0-4.9-1.79-5.7-4.2H2.9v2.63A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.3 13.8a5.99 5.99 0 0 1 0-3.6V7.57H2.9a10 10 0 0 0 0 8.86l3.4-2.63Z"
        fill="#FBBC04"
      />
      <path
        d="M12 5.98c1.5 0 2.84.52 3.9 1.54l2.92-2.92C17.06 2.98 14.75 2 12 2A10 10 0 0 0 2.9 7.57l3.4 2.63c.8-2.42 3.05-4.22 5.7-4.22Z"
        fill="#EA4335"
      />
    </svg>
  )
}

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0

  if (password.length >= 8) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  if (!password) {
    return {
      score: 0,
      label: "Start typing",
      description: "Use 8+ characters with uppercase, numbers, and symbols.",
    }
  }

  if (score <= 1) {
    return {
      score,
      label: "Weak",
      description: "Add length plus a better mix of letters, numbers, and symbols.",
    }
  }

  if (score === 2) {
    return {
      score,
      label: "Fair",
      description: "Close, but add another character type to strengthen it.",
    }
  }

  if (score === 3) {
    return {
      score,
      label: "Strong",
      description: "Solid password. One more layer makes it even better.",
    }
  }

  return {
    score,
    label: "Excellent",
    description: "Great password strength for a production account.",
  }
}

function getGoogleErrorMessage(authError: string | null) {
  switch (authError) {
    case "google_not_configured":
      return "Google sign-in is not configured yet. Add the Google OAuth client ID and secret in the backend env."
    case "google_auth_failed":
      return "Google sign-in could not be completed. Please try again."
    default:
      return null
  }
}

function AuthMetricCard({ metric }: { metric: AuthMetric }) {
  return (
    <div className="rounded-[22px] border border-white/12 bg-white/10 p-4 text-white backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
        {metric.label}
      </p>
      <p
        className={cn(
          "mt-3 font-heading text-3xl font-semibold tracking-tight",
          metric.tone === "success" ? "text-[#99f6e4]" : "text-white"
        )}
      >
        {metric.value}
      </p>
    </div>
  )
}

function AuthHighlightCard({ item }: { item: AuthHighlight }) {
  return (
    <div className="rounded-[24px] border border-white/90 bg-white/82 p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.4)] backdrop-blur">
      <span className="flex size-11 items-center justify-center rounded-2xl bg-[#ecfeff] text-[#0f766e]">
        <item.icon className="size-5" />
      </span>
      <p className="mt-4 font-heading text-lg font-semibold tracking-tight text-foreground">
        {item.title}
      </p>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        {item.description}
      </p>
    </div>
  )
}

function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = getPasswordStrength(password)

  return (
    <div className="rounded-[22px] border border-foreground/8 bg-[#f8faf8] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">Password strength</p>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
            strength.score >= 4
              ? "bg-[#dcfce7] text-[#166534]"
              : strength.score >= 3
                ? "bg-[#ecfeff] text-[#0f766e]"
                : strength.score >= 2
                  ? "bg-[#fef3c7] text-[#92400e]"
                  : "bg-[#fee2e2] text-[#991b1b]"
          )}
        >
          {strength.label}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={cn(
              "h-2 rounded-full transition-colors",
              index < strength.score
                ? strength.score >= 4
                  ? "bg-[#22c55e]"
                  : strength.score >= 3
                    ? "bg-[#14b8a6]"
                    : strength.score >= 2
                      ? "bg-[#f59e0b]"
                      : "bg-[#ef4444]"
                : "bg-foreground/8"
            )}
          />
        ))}
      </div>

      <p className="mt-3 text-xs leading-6 text-muted-foreground">
        {strength.description}
      </p>
    </div>
  )
}

function PasswordField({
  label,
  name,
  value,
  placeholder,
  autoComplete,
  showPassword,
  onToggle,
  onChange,
}: {
  label: string
  name: string
  value: string
  placeholder: string
  autoComplete?: string
  showPassword: boolean
  onToggle: () => void
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </span>

      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 rounded-2xl border-foreground/10 bg-white/80 px-4 pr-12 shadow-none"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[#f3f4f6] hover:text-foreground"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>
    </label>
  )
}

export function AuthPage({ mode, authError }: AuthPageProps) {
  const content = authContent[mode]
  const { user, isLoading, login, register } = useAuth()
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const googleAuthError = getGoogleErrorMessage(authError ?? null)
  const passwordStrength = getPasswordStrength(password)
  const googleAuthHref = `${API_BASE_URL}/api/auth/google?mode=${mode}`

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/")
    }
  }, [isLoading, router, user])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    try {
      if (mode === "register") {
        if (passwordStrength.score < 3) {
          throw new Error(
            "Password is too weak. Use 8+ characters with uppercase, numbers, and symbols."
          )
        }

        await register({
          name,
          email,
          password,
        })
      } else {
        await login({
          email,
          password,
        })
      }

      router.push("/")
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Authentication could not be completed"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-foreground/10 bg-[#f5f6ef]">
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="pointer-events-none absolute -left-20 top-10 h-[360px] w-[360px] rounded-full bg-[#99f6e4]/22 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-[360px] w-[360px] rounded-full bg-[#bfdbfe]/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-6 lg:px-8 lg:pb-24">
          <SiteHeader navItems={homeNavItems} actions={content.headerActions} />

          <div className="grid gap-12 pt-12 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.96fr)] xl:items-start">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/80 px-4 py-2 text-sm text-muted-foreground shadow-[0_16px_40px_-30px_rgba(15,23,42,0.42)] backdrop-blur">
                <ShieldCheck className="size-4 text-[#0f766e]" />
                {content.heroBadge}
              </div>

              <h1 className="mt-8 font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {content.title}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                {content.description}
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {content.highlights.map((item) => (
                  <AuthHighlightCard key={item.title} item={item} />
                ))}
              </div>

              <div className="mt-8 overflow-hidden rounded-[34px] border border-foreground/10 bg-[linear-gradient(145deg,#12314d_0%,#0f172a_58%,#0f766e_100%)] p-6 text-white shadow-[0_36px_110px_-70px_rgba(15,23,42,0.85)]">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(240px,0.92fr)]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#99f6e4]">
                      {content.previewEyebrow}
                    </p>
                    <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                      {content.previewTitle}
                    </h2>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-white/75">
                      {content.previewDescription}
                    </p>

                    <div className="mt-6 space-y-3">
                      {content.previewBullets.map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-3 rounded-[22px] border border-white/12 bg-white/8 px-4 py-3 backdrop-blur"
                        >
                          <CheckCircle2 className="mt-1 size-4 text-[#99f6e4]" />
                          <p className="text-sm leading-7 text-white/85">
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {content.metrics.map((metric) => (
                      <AuthMetricCard key={metric.label} metric={metric} />
                    ))}

                    <div className="rounded-[24px] border border-white/12 bg-white/8 p-5 backdrop-blur">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
                        Auth direction
                      </p>
                      <p className="mt-3 font-medium text-white">
                        Google and email entry points are both surfaced clearly.
                      </p>
                      <p className="mt-2 text-sm leading-7 text-white/75">
                        Sessions now use Mongo-backed users plus a secure JWT
                        cookie, so the header can react to real login state.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-x-10 top-8 h-24 rounded-full bg-[#67e8f9]/30 blur-3xl" />

              <div className="relative rounded-[34px] border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(241,250,248,0.94)_100%)] p-3 shadow-[0_42px_110px_-68px_rgba(15,23,42,0.5)]">
                <div className="rounded-[30px] border border-foreground/8 bg-white/92 p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
                        {content.formEyebrow}
                      </p>
                      <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
                        {content.formTitle}
                      </h2>
                    </div>

                    <span className="rounded-full border border-[#99f6e4] bg-[#ecfeff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#0f766e]">
                      {content.eyebrow}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {content.formDescription}
                  </p>

                  {formError || googleAuthError ? (
                    <div className="mt-5 rounded-[20px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#991b1b]">
                      {formError || googleAuthError}
                    </div>
                  ) : null}

                  <a
                    href={googleAuthHref}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "mt-6 h-12 w-full rounded-2xl border-foreground/10 bg-white px-5 text-sm font-medium shadow-[0_20px_40px_-32px_rgba(15,23,42,0.35)]"
                    )}
                  >
                    <GoogleMark />
                    {content.googleLabel}
                  </a>

                  <div className="mt-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-foreground/10" />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      or use email
                    </span>
                    <div className="h-px flex-1 bg-foreground/10" />
                  </div>

                  <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    {mode === "register" ? (
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-foreground">
                          Full name
                        </span>
                        <Input
                          type="text"
                          name="name"
                          value={name}
                          placeholder="Ashwin Khan"
                          autoComplete="name"
                          onChange={(event) => setName(event.target.value)}
                          className="h-12 rounded-2xl border-foreground/10 bg-white/80 px-4 shadow-none"
                        />
                      </label>
                    ) : null}

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-foreground">
                        Email
                      </span>
                      <Input
                        type="email"
                        name="email"
                        value={email}
                        placeholder="you@example.com"
                        autoComplete="email"
                        onChange={(event) => setEmail(event.target.value)}
                        className="h-12 rounded-2xl border-foreground/10 bg-white/80 px-4 shadow-none"
                      />
                    </label>

                    <PasswordField
                      label="Password"
                      name="password"
                      value={password}
                      placeholder={
                        mode === "register"
                          ? "Create a password"
                          : "Enter your password"
                      }
                      autoComplete={
                        mode === "register"
                          ? "new-password"
                          : "current-password"
                      }
                      showPassword={showPassword}
                      onToggle={() => setShowPassword((current) => !current)}
                      onChange={setPassword}
                    />

                    {mode === "register" ? (
                      <PasswordStrengthMeter password={password} />
                    ) : null}

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-foreground/8 bg-[#f8faf8] px-4 py-3">
                      <label className="flex items-start gap-3 text-sm text-foreground">
                        <input
                          type="checkbox"
                          className="mt-1 size-4 rounded border border-foreground/15 accent-[#0f766e]"
                          defaultChecked={mode === "login"}
                        />
                        <span>{content.helperText}</span>
                      </label>

                      <div className="flex flex-col items-end gap-1">
                        <Link
                          href={content.helperActionHref}
                          className="text-sm font-medium text-[#0f766e] transition-colors hover:text-[#115e59]"
                        >
                          {content.helperActionLabel}
                        </Link>
                        {mode === "login" && (
                          <Link
                            href="/forgot-password"
                            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                          >
                            Forgot password?
                          </Link>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "h-12 w-full rounded-2xl px-5 shadow-[0_22px_42px_-30px_rgba(15,118,110,0.8)] disabled:translate-y-0"
                      )}
                    >
                      {isSubmitting ? "Please wait..." : content.submitLabel}
                      <ArrowRight className="size-4" />
                    </button>
                  </form>

                  <div className="mt-6 rounded-[24px] border border-[#99f6e4] bg-[linear-gradient(135deg,#ecfeff_0%,#f8fffd_100%)] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="rounded-full border border-[#99f6e4] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0f766e]">
                        {content.infoBadge}
                      </span>
                      <span className="flex size-10 items-center justify-center rounded-2xl bg-[#12314d] text-white shadow-[0_18px_30px_-24px_rgba(18,49,77,0.8)]">
                        <Sparkles className="size-4" />
                      </span>
                    </div>
                    <p className="mt-4 font-heading text-xl font-semibold tracking-tight text-foreground">
                      {content.infoTitle}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {content.infoDescription}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/8 pt-5">
                    <p className="text-sm text-muted-foreground">
                      {content.prompt}{" "}
                      <Link
                        href={content.promptActionHref}
                        className="font-medium text-[#0f766e] transition-colors hover:text-[#115e59]"
                      >
                        {content.promptActionLabel}
                      </Link>
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {content.footerNote}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {[
                  "Google OAuth flow ready",
                  "Email + password auth live",
                  "Mongo-backed account storage",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/90 bg-white/82 px-3 py-2 text-sm text-foreground shadow-[0_12px_30px_-24px_rgba(15,23,42,0.28)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter navItems={marketingFooterItems} />
    </main>
  )
}
