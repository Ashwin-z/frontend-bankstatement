"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { API_BASE_URL } from "@/lib/api"

export type AuthUser = {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  phoneNumber: string | null
  company: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  region: string | null
  postalCode: string | null
  country: string | null
  dateOfBirth: string | null
  credits: number
  creditsPerDocument: number
  hasPurchasedCredits: boolean
  lifetimeCreditsPurchased: number
  subscriptionPlan: "free" | "credits" | "growth" | "premium"
  subscriptionStatus: "inactive" | "active" | "trialing" | "past_due" | "canceled"
  subscriptionRenewalAt: string | null
  activePlanKey: string | null
  activePlanName: string | null
  activePlanInterval: "monthly" | "annual" | null
  activePlanCredits: number
  preferences: {
    documentReadyEmails: boolean
    billingEmails: boolean
    productUpdates: boolean
  }
  authProviders: string[]
  lastLoginAt?: string | null
  createdAt?: string
  updatedAt?: string
}

type AuthPayload = {
  user: AuthUser
  message?: string
}

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  login: (payload: { email: string; password: string }) => Promise<AuthUser>
  register: (payload: {
    name: string
    email: string
    password: string
  }) => Promise<AuthUser>
  updateProfile: (payload: {
    name: string
    phoneNumber: string | null
    company: string | null
    addressLine1: string | null
    addressLine2: string | null
    city: string | null
    region: string | null
    postalCode: string | null
    country: string | null
    dateOfBirth: string | null
  }) => Promise<AuthUser>
  changePassword: (payload: {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
  }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<AuthUser | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function readJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      data?.message || "The request could not be completed right now"
    )
  }

  return data as T
}

async function fetchCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    credentials: "include",
  })

  if (response.status === 401) {
    return null
  }

  const data = await readJsonResponse<AuthPayload>(response)
  return data.user
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function refreshUser() {
    try {
      const currentUser = await fetchCurrentUser()
      setUser(currentUser)
      return currentUser
    } catch {
      setUser(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  async function register(payload: {
    name: string
    email: string
    password: string
  }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    })

    const data = await readJsonResponse<AuthPayload>(response)
    setUser(data.user)
    return data.user
  }

  async function login(payload: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    })

    const data = await readJsonResponse<AuthPayload>(response)
    setUser(data.user)
    return data.user
  }

  async function updateProfile(payload: {
    name: string
    phoneNumber: string | null
    company: string | null
    addressLine1: string | null
    addressLine2: string | null
    city: string | null
    region: string | null
    postalCode: string | null
    country: string | null
    dateOfBirth: string | null
  }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    })

    const data = await readJsonResponse<AuthPayload>(response)
    setUser(data.user)
    return data.user
  }

  async function changePassword(payload: {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
  }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    })

    await readJsonResponse<{ success: boolean; message?: string }>(response)
  }

  async function logout() {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
    } finally {
      setUser(null)
    }
  }

  useEffect(() => {
    let isMounted = true

    async function hydrateUser() {
      try {
        const currentUser = await fetchCurrentUser()

        if (!isMounted) {
          return
        }

        setUser(currentUser)
      } catch {
        if (!isMounted) {
          return
        }

        setUser(null)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void hydrateUser()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        updateProfile,
        changePassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
