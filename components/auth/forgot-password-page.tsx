"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ShieldCheck,
} from "lucide-react"

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

// ── password strength ──────────────────────────────────────────────────────────

type Rule = { label: string; test: (p: string) => boolean }

const passwordRules: Rule[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter (A–Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a–z)", test: (p) => /[a-z]/.test(p) },
  { label: "One number (0–9)", test: (p) => /\d/.test(p) },
  { label: "One special character (!@#$…)", test: (p) => /[^A-Za-z0-9]/.test(p) },
]

function PasswordRuleRow({ rule, value }: { rule: Rule; value: string }) {
  const passed = value.length > 0 && rule.test(value)
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full transition-colors",
          passed ? "bg-[#0f766e] text-white" : "bg-foreground/8 text-muted-foreground"
        )}
      >
        <CheckCircle2 className="size-2.5" />
      </span>
      <span className={cn("text-xs", passed ? "text-[#0f766e]" : "text-muted-foreground")}>
        {rule.label}
      </span>
    </div>
  )
}

// ── step 1 — email ─────────────────────────────────────────────────────────────

function StepEmail({
  onNext,
}: {
  onNext: (email: string) => void
}) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message || "Could not send reset code")
      onNext(email.trim().toLowerCase())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
          Step 1 of 3
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
          Forgot your password?
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Enter the email address linked to your account and we&apos;ll send a
          6-digit reset code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-[10px] pl-9"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-[10px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#991b1b]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            buttonVariants({ size: "lg" }),
            "w-full rounded-[10px] bg-[linear-gradient(135deg,#12314d_0%,#0f766e_100%)] text-white hover:opacity-95 disabled:translate-y-0"
          )}
        >
          {loading ? "Sending…" : "Send reset code"}
          <ArrowRight className="size-4" />
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}

// ── step 2 — OTP ───────────────────────────────────────────────────────────────

function StepOtp({
  email,
  onNext,
  onBack,
}: {
  email: string
  onNext: (resetToken: string) => void
  onBack: () => void
}) {
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendMsg, setResendMsg] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message || "Invalid code")
      onNext(data.resetToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    setError(null)
    setResendMsg(null)
    try {
      await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setResendMsg("A new code has been sent.")
    } catch {
      setError("Could not resend. Please try again.")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
          Step 2 of 3
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
          Enter your reset code
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          We sent a 6-digit code to{" "}
          <strong className="text-foreground">{email}</strong>. It expires in
          10 minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="otp" className="text-sm font-medium text-foreground">
            Reset code
          </label>
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            maxLength={6}
            className="rounded-[10px] text-center text-2xl font-bold tracking-[0.3em]"
          />
        </div>

        {error && (
          <div className="rounded-[10px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#991b1b]">
            {error}
          </div>
        )}
        {resendMsg && (
          <div className="rounded-[10px] border border-[#99f6e4] bg-[#ecfeff] px-4 py-3 text-sm text-[#0f766e]">
            {resendMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className={cn(
            buttonVariants({ size: "lg" }),
            "w-full rounded-[10px] bg-[linear-gradient(135deg,#12314d_0%,#0f766e_100%)] text-white hover:opacity-95 disabled:translate-y-0"
          )}
        >
          {loading ? "Verifying…" : "Verify code"}
          <ShieldCheck className="size-4" />
        </button>
      </form>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Change email
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="font-medium text-foreground hover:underline disabled:opacity-50"
        >
          {resending ? "Sending…" : "Resend code"}
        </button>
      </div>
    </div>
  )
}

// ── step 3 — new password ──────────────────────────────────────────────────────

function StepNewPassword({
  email,
  resetToken,
}: {
  email: string
  resetToken: string
}) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const allRulesPassed = passwordRules.every((r) => r.test(password))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!allRulesPassed) {
      setError("Password does not meet all requirements.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetToken, newPassword: password, confirmPassword: confirm }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message || "Reset failed")
      setDone(true)
      setTimeout(() => router.push("/login"), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-[#ecfeff]">
          <CheckCircle2 className="size-8 text-[#0f766e]" />
        </span>
        <p className="font-heading text-2xl font-semibold text-foreground">
          Password updated!
        </p>
        <p className="text-sm text-muted-foreground">
          Redirecting you to sign in…
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
          Step 3 of 3
        </p>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
          Create a new password
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New password */}
        <div className="space-y-1.5">
          <label htmlFor="new-password" className="text-sm font-medium text-foreground">
            New password
          </label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-[10px] pl-9 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Password rules */}
        {password.length > 0 && (
          <div className="rounded-[10px] border border-foreground/8 bg-[#f8faf8] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Password requirements
            </p>
            <div className="space-y-2">
              {passwordRules.map((rule) => (
                <PasswordRuleRow key={rule.label} rule={rule} value={password} />
              ))}
            </div>
          </div>
        )}

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
            Confirm password
          </label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className={cn(
                "rounded-[10px] pl-9 pr-10",
                confirm.length > 0 && confirm !== password && "border-red-300 focus-visible:ring-red-200"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {confirm.length > 0 && confirm !== password && (
            <p className="text-xs text-red-500">Passwords do not match</p>
          )}
        </div>

        {error && (
          <div className="rounded-[10px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#991b1b]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !allRulesPassed || password !== confirm}
          className={cn(
            buttonVariants({ size: "lg" }),
            "w-full rounded-[10px] bg-[linear-gradient(135deg,#12314d_0%,#0f766e_100%)] text-white hover:opacity-95 disabled:translate-y-0"
          )}
        >
          {loading ? "Saving…" : "Set new password"}
          <CheckCircle2 className="size-4" />
        </button>
      </form>
    </div>
  )
}

// ── main page ──────────────────────────────────────────────────────────────────

export function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState("")
  const [resetToken, setResetToken] = useState("")

  const headerActions = [
    { href: "/login", label: "Sign in", variant: "outline" as const },
    { href: "/register", label: "Register", variant: "default" as const },
  ]

  return (
    <main className="bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-foreground/10 bg-[#f5f6ef]">
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-6 lg:px-8">
          <SiteHeader navItems={homeNavItems} actions={headerActions} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[1fr_420px] lg:gap-24">

          {/* Left: decorative info panel */}
          <div className="hidden lg:flex lg:flex-col lg:justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
              Account recovery
            </p>
            <h2 className="mt-4 font-heading text-4xl font-semibold leading-tight tracking-tight text-foreground">
              Back in your workspace in three quick steps.
            </h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              Enter your email, verify your identity with a one-time code, then
              choose a new password — all without leaving this page.
            </p>

            <div className="mt-10 space-y-5">
              {[
                { n: "01", title: "Enter your email", desc: "We'll send a 6-digit code if the address is registered." },
                { n: "02", title: "Verify with OTP", desc: "The code expires in 10 minutes so your account stays secure." },
                { n: "03", title: "Set a new password", desc: "Choose a strong password that meets our security requirements." },
              ].map((s) => (
                <div key={s.n} className="flex items-start gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] border border-[#99f6e4] bg-[#ecfeff] text-sm font-bold text-[#0f766e]">
                    {s.n}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{s.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form card */}
          <div>
            {/* Step indicator */}
            <div className="mb-8 flex items-center gap-2">
              {([1, 2, 3] as const).map((n) => (
                <div
                  key={n}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-300",
                    n <= step ? "bg-[#0f766e]" : "bg-foreground/10"
                  )}
                />
              ))}
            </div>

            <div className="rounded-[28px] border border-foreground/8 bg-white p-8 shadow-[0_28px_80px_-54px_rgba(15,23,42,0.24)]">
              {step === 1 && (
                <StepEmail
                  onNext={(e) => {
                    setEmail(e)
                    setStep(2)
                  }}
                />
              )}
              {step === 2 && (
                <StepOtp
                  email={email}
                  onNext={(token) => {
                    setResetToken(token)
                    setStep(3)
                  }}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && (
                <StepNewPassword email={email} resetToken={resetToken} />
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter navItems={marketingFooterItems} />
    </main>
  )
}
