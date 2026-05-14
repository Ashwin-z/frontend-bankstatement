"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  FolderOpen,
  Globe,
  History,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type NavItem = {
  href: string
  label: string
}

type HeaderAction = NavItem & {
  variant?: "default" | "outline" | "ghost"
}

type SiteHeaderProps = {
  navItems: NavItem[]
  actions?: HeaderAction[]
  className?: string
}

const defaultHeaderActions: HeaderAction[] = [
  {
    href: "/login",
    label: "Login",
    variant: "outline",
  },
  {
    href: "/register",
    label: "Register",
    variant: "default",
  },
]

const siteLanguages = [
  {
    code: "en",
    label: "English",
  },
  {
    code: "ur",
    label: "Urdu",
  },
  {
    code: "ar",
    label: "Arabic",
  },
] as const

const languageStorageKey = "bsc-language"

function getUserInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
}

function HeaderLink({
  href,
  label,
  variant = "ghost",
}: HeaderAction) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant, size: "lg" }),
        "rounded-full px-5 text-sm shadow-none"
      )}
    >
      {label}
    </Link>
  )
}

function LanguageSwitcher() {
  const [selectedLanguage, setSelectedLanguage] = useState<
    (typeof siteLanguages)[number]["code"]
  >(() => {
    if (typeof window === "undefined") {
      return "en"
    }

    const storedLanguage = window.localStorage.getItem(languageStorageKey)

    if (
      storedLanguage &&
      siteLanguages.some((language) => language.code === storedLanguage)
    ) {
      return storedLanguage as (typeof siteLanguages)[number]["code"]
    }

    const currentLanguage = document.documentElement.lang

    if (
      currentLanguage &&
      siteLanguages.some((language) => language.code === currentLanguage)
    ) {
      return currentLanguage as (typeof siteLanguages)[number]["code"]
    }

    return "en"
  })

  useEffect(() => {
    document.documentElement.lang = selectedLanguage
  }, [selectedLanguage])

  return (
    <div className="relative">
      <Globe className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-[#0f766e]" />
      <select
        aria-label="Select language"
        value={selectedLanguage}
        onChange={(event) => {
          const nextLanguage = event.target
            .value as (typeof siteLanguages)[number]["code"]

          setSelectedLanguage(nextLanguage)
          window.localStorage.setItem(languageStorageKey, nextLanguage)
        }}
        className={cn(
          "h-10 appearance-none rounded-full border border-foreground/10 bg-white/80 py-0 pl-11 pr-12 text-sm font-medium text-foreground shadow-none outline-none transition-colors hover:bg-white focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 backdrop-blur"
        )}
      >
        {siteLanguages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

export function SiteHeader({
  navItems,
  actions = defaultHeaderActions,
  className,
}: SiteHeaderProps) {
  const { user, isLoading, logout } = useAuth()
  const pathname = usePathname()

  return (
    <header
      className={cn(
        "relative z-[90] isolate mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 rounded-full border border-white/80 bg-white/85 px-4 py-3 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl",
        className
      )}
    >
      <Link
        href="/"
        className="flex items-center gap-3 rounded-full pr-3 transition-transform hover:-translate-y-0.5"
      >
        <Image
          src="/logo-icon.png"
          alt="BSC logo"
          width={256}
          height={256}
          className="size-11 rounded-full object-cover shadow-[0_12px_24px_-18px_rgba(18,49,77,0.65)]"
        />
        <span>
          <span className="block font-heading text-base font-semibold tracking-tight text-foreground">
            Bank Statement Convertor
          </span>
          <span className="hidden text-xs text-muted-foreground sm:block">
            bankstatementconvertor.io
          </span>
        </span>
      </Link>

      <nav className="hidden items-center gap-6 text-sm lg:flex">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors hover:text-foreground",
              pathname === item.href
                ? "font-semibold text-foreground"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        <LanguageSwitcher />
        {user ? (
          <>
            <div className="group/profile relative z-[95]">
              <Link
                href="/profile"
                className="flex h-10 items-center gap-2.5 rounded-full border border-foreground/10 bg-white/85 px-2.5 shadow-none backdrop-blur transition-colors hover:bg-white"
              >
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    width={56}
                    height={56}
                    className="size-7 rounded-full object-cover ring-1 ring-foreground/10"
                  />
                ) : (
                  <span className="flex size-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#12314d_0%,#0f766e_100%)] text-xs font-semibold text-white shadow-[0_8px_16px_-12px_rgba(15,118,110,0.75)]">
                    {getUserInitials(user.name)}
                  </span>
                )}

                <div className="hidden min-w-0 sm:block">
                  <p className="max-w-[180px] truncate text-sm font-medium text-foreground">
                    {user.name}
                  </p>
                </div>

                <ChevronDown className="size-4 text-muted-foreground transition-transform group-hover/profile:rotate-180 group-focus-within/profile:rotate-180" />
              </Link>

              <div className="pointer-events-none absolute right-0 top-full z-[120] pt-2 opacity-0 transition-all duration-150 group-hover/profile:pointer-events-auto group-hover/profile:opacity-100 group-focus-within/profile:pointer-events-auto group-focus-within/profile:opacity-100">
                <div className="w-56 rounded-[22px] border border-white/85 bg-white/95 p-2 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur-xl">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 rounded-[16px] px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[#f5f7f7]"
                  >
                    <UserRound className="size-4 text-[#0f766e]" />
                    Profile
                  </Link>

                  <Link
                    href="/settings"
                    className="mt-1 flex items-center gap-3 rounded-[16px] px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[#f5f7f7]"
                  >
                    <Settings className="size-4 text-[#0f766e]" />
                    Settings
                  </Link>

                  <div className="my-2 h-px bg-foreground/8" />

                  <Link
                    href="/documents"
                    className="flex items-center gap-3 rounded-[16px] px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[#f5f7f7]"
                  >
                    <FolderOpen className="size-4 text-[#0f766e]" />
                    PDF Library
                  </Link>

                  <Link
                    href="/credits"
                    className="mt-1 flex items-center gap-3 rounded-[16px] px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[#f5f7f7]"
                  >
                    <History className="size-4 text-[#0f766e]" />
                    Credit History
                  </Link>

                  <div className="my-2 h-px bg-foreground/8" />

                  <button
                    type="button"
                    onClick={async () => {
                      await logout()
                    }}
                    className="flex w-full items-center gap-3 rounded-[16px] px-3 py-3 text-left text-sm font-medium text-[#991b1b] transition-colors hover:bg-[#fff1f2]"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : isLoading ? (
          <div className="h-10 min-w-[132px] rounded-full border border-foreground/10 bg-white/70 px-4" />
        ) : (
          actions.map((action) => (
            <HeaderLink key={`${action.href}-${action.label}`} {...action} />
          ))
        )}
      </div>
    </header>
  )
}
