"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  FolderOpen,
  History,
  KeyRound,
  Save,
  Settings,
  ShieldCheck,
} from "lucide-react"

import { useAuth, type AuthUser } from "@/components/auth/auth-provider"
import {
  homeNavItems,
  marketingFooterItems,
} from "@/components/home/home-content"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

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
    return "Not set yet"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Not set yet"
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function toDateInputValue(value?: string | null) {
  if (!value) {
    return ""
  }

  return value.slice(0, 10)
}

type ProfileDraft = {
  name: string
  phoneNumber: string
  company: string
  addressLine1: string
  addressLine2: string
  city: string
  region: string
  postalCode: string
  country: string
  dateOfBirth: string
}

function createProfileDraft(user: AuthUser): ProfileDraft {
  return {
    name: user.name,
    phoneNumber: user.phoneNumber ?? "",
    company: user.company ?? "",
    addressLine1: user.addressLine1 ?? "",
    addressLine2: user.addressLine2 ?? "",
    city: user.city ?? "",
    region: user.region ?? "",
    postalCode: user.postalCode ?? "",
    country: user.country ?? "",
    dateOfBirth: toDateInputValue(user.dateOfBirth),
  }
}

export function ProfilePage() {
  const {
    user,
    isLoading,
    updateProfile,
    changePassword,
  } = useAuth()
  const router = useRouter()

  const [profileDraft, setProfileDraft] = useState<Partial<ProfileDraft>>({})
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [securityMessage, setSecurityMessage] = useState<string | null>(null)
  const [securityError, setSecurityError] = useState<string | null>(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [isLoading, router, user])

  const authMethodLabel = useMemo(() => {
    if (!user) {
      return ""
    }

    if (
      user.authProviders.includes("google") &&
      user.authProviders.includes("local")
    ) {
      return "Google + Email"
    }

    if (user.authProviders.includes("google")) {
      return "Google"
    }

    return "Email"
  }, [user])

  const canChangePassword = user?.authProviders.includes("local") ?? false

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProfileMessage(null)
    setProfileError(null)
    setIsSavingProfile(true)

    try {
      if (!user) {
        throw new Error("You must be logged in to update your profile")
      }

      const nextProfileDraft = {
        ...createProfileDraft(user),
        ...profileDraft,
      }
      await updateProfile({
        name: nextProfileDraft.name.trim(),
        phoneNumber: nextProfileDraft.phoneNumber.trim() || null,
        company: nextProfileDraft.company.trim() || null,
        addressLine1: nextProfileDraft.addressLine1.trim() || null,
        addressLine2: nextProfileDraft.addressLine2.trim() || null,
        city: nextProfileDraft.city.trim() || null,
        region: nextProfileDraft.region.trim() || null,
        postalCode: nextProfileDraft.postalCode.trim() || null,
        country: nextProfileDraft.country.trim() || null,
        dateOfBirth: nextProfileDraft.dateOfBirth || null,
      })

      setProfileDraft({})
      setProfileMessage("Profile updated successfully")
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "Profile update failed"
      )
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSecurityMessage(null)
    setSecurityError(null)
    setIsChangingPassword(true)

    try {
      if (!user) {
        throw new Error("You must be logged in to change your password")
      }

      await changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
      setSecurityMessage("Password updated successfully")
    } catch (error) {
      setSecurityError(
        error instanceof Error ? error.message : "Password update failed"
      )
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isLoading || !user) {
    return (
      <main className="bg-background text-foreground">
        <section className="min-h-screen bg-[#f5f6ef]">
          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
            <div className="h-16 rounded-full border border-white/80 bg-white/80" />
            <div className="mt-10 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="h-80 rounded-[32px] border border-white/80 bg-white/80" />
              <div className="h-[640px] rounded-[32px] border border-white/80 bg-white/80" />
            </div>
          </div>
        </section>
      </main>
    )
  }

  const profileSnapshot = {
    ...createProfileDraft(user),
    ...profileDraft,
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
                    {user.credits} credits
                  </span>
                  <span className="rounded-full border border-foreground/10 bg-[#f8faf8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {authMethodLabel}
                  </span>
                </div>

                <Link
                  href="/settings#subscription"
                  className="mt-4 text-sm font-medium text-[#0f766e] underline underline-offset-4 transition-colors hover:text-[#12314d]"
                >
                  Buy credits or manage subscription
                </Link>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-[22px] border border-foreground/8 bg-[#f8faf8] p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-white text-[#0f766e] ring-1 ring-foreground/8">
                      <ShieldCheck className="size-4" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Member since
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/settings"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "mt-4 w-full rounded-full border-foreground/10 bg-white"
                )}
              >
                <Settings className="size-4" />
                Account settings
                <ArrowRight className="size-4 ml-auto" />
              </Link>

              <Link
                href="/documents"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "mt-2 w-full rounded-full border-foreground/10 bg-white"
                )}
              >
                <FolderOpen className="size-4" />
                PDF library
                <ArrowRight className="size-4 ml-auto" />
              </Link>

              <Link
                href="/credits"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "mt-2 w-full rounded-full border-foreground/10 bg-white"
                )}
              >
                <History className="size-4" />
                Credit history
                <ArrowRight className="size-4 ml-auto" />
              </Link>
            </aside>

            <div className="space-y-6">
              <section className="rounded-[34px] border border-white/85 bg-white/90 p-6 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.38)] backdrop-blur sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
                      Profile
                    </p>
                    <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
                      Profile details
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                      Update the personal and contact details you want to keep
                      with your account. Email stays visible but cannot be
                      edited.
                    </p>
                  </div>

                  <Link
                    href="/"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "rounded-full border-foreground/10 bg-white px-5"
                    )}
                  >
                    Back to workspace
                    <ArrowRight className="size-4" />
                  </Link>
                </div>

                {profileMessage ? (
                  <div className="mt-5 rounded-[20px] border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]">
                    {profileMessage}
                  </div>
                ) : null}

                {profileError ? (
                  <div className="mt-5 rounded-[20px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#991b1b]">
                    {profileError}
                  </div>
                ) : null}

                <form
                  className="mt-6 grid gap-5 lg:grid-cols-2"
                  onSubmit={handleProfileSubmit}
                >
                  <div className="lg:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                      Identity
                    </p>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-foreground">
                      Full name
                    </span>
                    <Input
                      value={profileSnapshot.name}
                      onChange={(event) =>
                        setProfileDraft((currentDraft) => ({
                          ...currentDraft,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Your full name"
                      autoComplete="name"
                      className="h-12 rounded-2xl border-foreground/10 bg-white px-4 shadow-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-foreground">
                      Company
                    </span>
                    <Input
                      value={profileSnapshot.company}
                      onChange={(event) =>
                        setProfileDraft((currentDraft) => ({
                          ...currentDraft,
                          company: event.target.value,
                        }))
                      }
                      placeholder="Optional company or team name"
                      autoComplete="organization"
                      className="h-12 rounded-2xl border-foreground/10 bg-white px-4 shadow-none"
                    />
                  </label>

                  <label className="block lg:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-foreground">
                      Email address
                    </span>
                    <Input
                      value={user.email}
                      readOnly
                      className="h-12 rounded-2xl border-foreground/10 bg-[#f8faf8] px-4 text-muted-foreground shadow-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-foreground">
                      Phone number
                    </span>
                    <Input
                      type="tel"
                      value={profileSnapshot.phoneNumber}
                      onChange={(event) =>
                        setProfileDraft((currentDraft) => ({
                          ...currentDraft,
                          phoneNumber: event.target.value,
                        }))
                      }
                      placeholder="+92 300 1234567"
                      autoComplete="tel"
                      className="h-12 rounded-2xl border-foreground/10 bg-white px-4 shadow-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-foreground">
                      Date of birth
                    </span>
                    <Input
                      type="date"
                      value={profileSnapshot.dateOfBirth}
                      onChange={(event) =>
                        setProfileDraft((currentDraft) => ({
                          ...currentDraft,
                          dateOfBirth: event.target.value,
                        }))
                      }
                      className="h-12 rounded-2xl border-foreground/10 bg-white px-4 shadow-none"
                    />
                  </label>

                  <div className="lg:col-span-2 pt-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                      Address
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      These fields are optional, but they help complete the
                      account profile for invoices, billing, and support later.
                    </p>
                  </div>

                  <label className="block lg:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-foreground">
                      Address line 1
                    </span>
                    <Input
                      value={profileSnapshot.addressLine1}
                      onChange={(event) =>
                        setProfileDraft((currentDraft) => ({
                          ...currentDraft,
                          addressLine1: event.target.value,
                        }))
                      }
                      placeholder="Street address, building, or house number"
                      autoComplete="address-line1"
                      className="h-12 rounded-2xl border-foreground/10 bg-white px-4 shadow-none"
                    />
                  </label>

                  <label className="block lg:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-foreground">
                      Address line 2
                    </span>
                    <Input
                      value={profileSnapshot.addressLine2}
                      onChange={(event) =>
                        setProfileDraft((currentDraft) => ({
                          ...currentDraft,
                          addressLine2: event.target.value,
                        }))
                      }
                      placeholder="Apartment, suite, floor, or landmark"
                      autoComplete="address-line2"
                      className="h-12 rounded-2xl border-foreground/10 bg-white px-4 shadow-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-foreground">
                      City
                    </span>
                    <Input
                      value={profileSnapshot.city}
                      onChange={(event) =>
                        setProfileDraft((currentDraft) => ({
                          ...currentDraft,
                          city: event.target.value,
                        }))
                      }
                      placeholder="Karachi"
                      autoComplete="address-level2"
                      className="h-12 rounded-2xl border-foreground/10 bg-white px-4 shadow-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-foreground">
                      State / region
                    </span>
                    <Input
                      value={profileSnapshot.region}
                      onChange={(event) =>
                        setProfileDraft((currentDraft) => ({
                          ...currentDraft,
                          region: event.target.value,
                        }))
                      }
                      placeholder="Sindh"
                      autoComplete="address-level1"
                      className="h-12 rounded-2xl border-foreground/10 bg-white px-4 shadow-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-foreground">
                      Postal code
                    </span>
                    <Input
                      value={profileSnapshot.postalCode}
                      onChange={(event) =>
                        setProfileDraft((currentDraft) => ({
                          ...currentDraft,
                          postalCode: event.target.value,
                        }))
                      }
                      placeholder="75000"
                      autoComplete="postal-code"
                      className="h-12 rounded-2xl border-foreground/10 bg-white px-4 shadow-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-foreground">
                      Country
                    </span>
                    <Input
                      value={profileSnapshot.country}
                      onChange={(event) =>
                        setProfileDraft((currentDraft) => ({
                          ...currentDraft,
                          country: event.target.value,
                        }))
                      }
                      placeholder="Pakistan"
                      autoComplete="country-name"
                      className="h-12 rounded-2xl border-foreground/10 bg-white px-4 shadow-none"
                    />
                  </label>

                  <div className="lg:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "rounded-full px-5 shadow-[0_18px_40px_-28px_rgba(15,118,110,0.8)] disabled:translate-y-0"
                      )}
                    >
                      {isSavingProfile ? "Saving..." : "Save profile"}
                      <Save className="size-4" />
                    </button>
                  </div>
                </form>
              </section>

              <section
                id="settings"
                className="rounded-[34px] border border-white/85 bg-white/90 p-6 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.38)] backdrop-blur sm:p-8"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
                      Settings
                    </p>
                    <h2 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
                      Security
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                      Change your password here. If this account is currently
                      Google-only, password changes stay disabled for now.
                    </p>
                  </div>

                  <span className="flex size-12 items-center justify-center rounded-2xl bg-[#ecfeff] text-[#0f766e]">
                    <Settings className="size-5" />
                  </span>
                </div>

                {securityMessage ? (
                  <div className="mt-5 rounded-[20px] border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]">
                    {securityMessage}
                  </div>
                ) : null}

                {securityError ? (
                  <div className="mt-5 rounded-[20px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#991b1b]">
                    {securityError}
                  </div>
                ) : null}

                {!canChangePassword ? (
                  <div className="mt-5 rounded-[22px] border border-[#bfdbfe] bg-[#eff6ff] px-4 py-4 text-sm text-[#1d4ed8]">
                    This account currently uses Google sign-in only. Local
                    password changes are not available yet.
                  </div>
                ) : null}

                <form
                  className="mt-6 grid gap-5 lg:grid-cols-2"
                  onSubmit={handlePasswordSubmit}
                >
                  <label className="block lg:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-foreground">
                      Current password
                    </span>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(event) =>
                        setCurrentPassword(event.target.value)
                      }
                      autoComplete="current-password"
                      className="h-12 rounded-2xl border-foreground/10 bg-white px-4 shadow-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-foreground">
                      New password
                    </span>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      autoComplete="new-password"
                      className="h-12 rounded-2xl border-foreground/10 bg-white px-4 shadow-none"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-foreground">
                      Confirm new password
                    </span>
                    <Input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(event) =>
                        setConfirmNewPassword(event.target.value)
                      }
                      autoComplete="new-password"
                      className="h-12 rounded-2xl border-foreground/10 bg-white px-4 shadow-none"
                    />
                  </label>

                  <div className="lg:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isChangingPassword || !canChangePassword}
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "rounded-full px-5 shadow-[0_18px_40px_-28px_rgba(15,118,110,0.8)] disabled:translate-y-0"
                      )}
                    >
                      {isChangingPassword ? "Updating..." : "Change password"}
                      <KeyRound className="size-4" />
                    </button>
                  </div>
                </form>
              </section>

            </div>
          </div>
        </div>
      </section>

      <SiteFooter navItems={marketingFooterItems} />
    </main>
  )
}
