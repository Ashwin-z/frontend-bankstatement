"use client"

import Link from "next/link"
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react"
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Rocket,
  Sparkles,
  Square,
  Trash2,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { buttonVariants } from "@/components/ui/button"
import { API_BASE_URL } from "@/lib/api"
import { cn } from "@/lib/utils"

// ─── helpers ─────────────────────────────────────────────────────────────────

function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  )
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  const mb = bytes / (1024 * 1024)
  return `${mb >= 10 ? mb.toFixed(0) : mb.toFixed(1)} MB`
}

function collectPdfFiles(files: FileList | File[]) {
  const all = Array.from(files)
  const accepted = all.filter(isPdfFile)
  return { acceptedFiles: accepted, rejectedCount: all.length - accepted.length }
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.style.display = "none"
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ─── types ───────────────────────────────────────────────────────────────────

type TransactionRow = {
  date: string
  description: string
  debit: string
  credit: string
  balance: string
}

type FileItemStatus = "pending" | "processing" | "done" | "failed" | "stopped"

type ConversionItem = {
  uid: string
  file: File
  status: FileItemStatus
  jobId?: string | null
  bankName?: string | null
  statementPeriod?: string | null
  pageCount?: number
  rowCount?: number
  rows?: TransactionRow[]
  error?: string
  showPreview?: boolean
  saved?: boolean
  saving?: boolean
  isRestored?: boolean
  overCreditLimit?: boolean
}

type Phase = "idle" | "staging" | "processing" | "done"

type UploadAccessPlan = {
  icon: LucideIcon
  name: string
  eyebrow: string
  description: string
  pages: string
  unit: string
  window: string
  meterWidth: string
  price: string
  featured: boolean
  footer: string
  highlights: string[]
  actionLabel: string
  href?: string | null
}

// ─── access plan data ─────────────────────────────────────────────────────────

const uploadAccessPlans: UploadAccessPlan[] = [
  {
    icon: Sparkles,
    name: "Guest",
    eyebrow: "Starter lane",
    description: "Try the converter instantly without creating an account.",
    pages: "3",
    unit: "pages",
    window: "Resets every 24 hours",
    meterWidth: "30%",
    price: "Free",
    featured: false,
    footer: "No signup required",
    highlights: ["Quick single-statement tests", "Fast first-use experience"],
    actionLabel: "Start now",
    href: null,
  },
  {
    icon: BadgeCheck,
    name: "Registered",
    eyebrow: "Free workspace",
    description: "Create a free workspace for more daily conversion room.",
    pages: "8",
    unit: "pages",
    window: "Resets every 24 hours",
    meterWidth: "58%",
    price: "Free",
    featured: false,
    footer: "Registration stays free",
    highlights: ["Higher daily conversion room", "Better fit for repeat use"],
    actionLabel: "Register free",
    href: null,
  },
  {
    icon: Rocket,
    name: "Subscribe",
    eyebrow: "Scale up",
    description:
      "Unlock higher throughput, larger batches, and a smoother ops flow.",
    pages: "More",
    unit: "capacity",
    window: "Higher limits on paid plans",
    meterWidth: "100%",
    price: "See plans",
    featured: true,
    footer: "Designed for regular operations",
    highlights: [
      "Higher throughput and larger batches",
      "Best fit for ongoing workflows",
    ],
    actionLabel: "View pricing",
    href: "/pricing",
  },
]

// ─── transaction preview table ────────────────────────────────────────────────

function TransactionTable({ rows }: { rows: TransactionRow[] }) {
  const preview = rows.slice(0, 30)
  const overflow = rows.length - preview.length
  return (
    <div className="mt-3 overflow-x-auto rounded-[20px] border border-foreground/8 bg-white">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-foreground/8 bg-[#f0fdfa]">
            {["Date", "Description", "Debit", "Credit", "Balance"].map((col) => (
              <th
                key={col}
                className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0f766e]"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {preview.map((row, i) => (
            <tr
              key={i}
              className={cn(
                "border-b border-foreground/6 last:border-0",
                i % 2 === 1 ? "bg-[#f8faf8]" : "bg-white"
              )}
            >
              <td className="whitespace-nowrap px-4 py-2 text-xs text-muted-foreground">{row.date}</td>
              <td className="max-w-[240px] truncate px-4 py-2 text-xs text-foreground">{row.description}</td>
              <td className="whitespace-nowrap px-4 py-2 text-right text-xs text-foreground">{row.debit || "—"}</td>
              <td className="whitespace-nowrap px-4 py-2 text-right text-xs text-[#0f766e]">{row.credit || "—"}</td>
              <td className="whitespace-nowrap px-4 py-2 text-right text-xs font-medium text-foreground">{row.balance || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {overflow > 0 && (
        <p className="px-4 py-2 text-xs text-muted-foreground">
          +{overflow} more rows — download the file to see all data.
        </p>
      )}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export function UploadIntakePanel() {
  const inputId = useId()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { user, refreshUser } = useAuth()

  const [items, setItems] = useState<ConversionItem[]>([])
  const [phase, setPhase] = useState<Phase>("idle")
  const [rejectedCount, setRejectedCount] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [conversionError, setConversionError] = useState<string | null>(null)

  const [showCreditDialog, setShowCreditDialog] = useState(false)
  const [autoResetCountdown, setAutoResetCountdown] = useState<number | null>(null)

  const stopRef = useRef(false)
  const cancelledRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)
  const isProcessingRef = useRef(false)
  const blobUrlsRef = useRef<Map<string, string>>(new Map())
  const pollIntervalRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map())
  const pollResolversRef = useRef<Array<() => void>>([])
  const didLoadJobsRef = useRef(false)
  const autoResetTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── load active/recent jobs on mount (logged-in users) ───────────────────

  useEffect(() => {
    if (!user || didLoadJobsRef.current) return
    didLoadJobsRef.current = true

    async function loadRecentJobs() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/convert/my-jobs`, {
          credentials: "include",
        })
        if (!res.ok) return
        const data = await res.json().catch(() => null)
        if (!data?.jobs?.length) return

        const serverJobs: Array<{
          jobId: string
          originalName: string
          status: string
          bankName?: string | null
          statementPeriod?: string | null
          pageCount?: number
          rowCount?: number
          rows?: TransactionRow[]
          error?: string
        }> = data.jobs

        // Only restore jobs that are still actively processing — completed jobs
        // auto-cleared so the panel stays clean on revisit
        const activeServerJobs = serverJobs.filter(
          (j) => j.status !== "done" && j.status !== "failed"
        )
        if (activeServerJobs.length === 0) return

        const restoredItems: ConversionItem[] = activeServerJobs.map((job) => ({
          uid: job.jobId,
          file: new File([], job.originalName, { type: "application/pdf" }),
          status: "processing" as FileItemStatus,
          jobId: job.jobId,
          bankName: job.bankName ?? null,
          statementPeriod: job.statementPeriod ?? null,
          pageCount: job.pageCount ?? 0,
          rowCount: job.rowCount ?? 0,
          rows: job.rows ?? [],
          error: job.error,
          showPreview: false,
          isRestored: true,
        }))

        setItems(restoredItems)
        setPhase("processing")
        isProcessingRef.current = true
        const pollPromises = restoredItems.map((item) =>
          pollJobUntilDone(item.uid, item.jobId!)
        )
        Promise.all(pollPromises).then(() => {
          setItems((prev) =>
            prev.map((i) =>
              i.status === "pending" ? { ...i, status: "stopped" } : i
            )
          )
          setPhase("done")
          isProcessingRef.current = false
        })
      } catch {
        // silently ignore
      }
    }

    void loadRecentJobs()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── cleanup polls on unmount ──────────────────────────────────────────────

  useEffect(() => {
    return () => {
      pollIntervalRef.current.forEach((id) => clearInterval(id))
      pollIntervalRef.current.clear()
    }
  }, [])

  // ── auto-reset when done phase completes ──────────────────────────────────

  useEffect(() => {
    if (phase !== "done") {
      if (autoResetTimerRef.current) {
        clearInterval(autoResetTimerRef.current)
        autoResetTimerRef.current = null
      }
      setAutoResetCountdown(null)
      return
    }

    let count = 30
    setAutoResetCountdown(count)

    autoResetTimerRef.current = setInterval(() => {
      count--
      if (count <= 0) {
        if (autoResetTimerRef.current) {
          clearInterval(autoResetTimerRef.current)
          autoResetTimerRef.current = null
        }
        pollIntervalRef.current.forEach((id) => clearInterval(id))
        pollIntervalRef.current.clear()
        pollResolversRef.current.splice(0)
        blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
        blobUrlsRef.current.clear()
        setItems([])
        setPhase("idle")
        setConversionError(null)
        setRejectedCount(0)
        setAutoResetCountdown(null)
      } else {
        setAutoResetCountdown(count)
      }
    }, 1000)

    return () => {
      if (autoResetTimerRef.current) {
        clearInterval(autoResetTimerRef.current)
        autoResetTimerRef.current = null
      }
      setAutoResetCountdown(null)
    }
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── computed ──────────────────────────────────────────────────────────────

  const doneCount = items.filter((i) => i.status === "done").length
  const failedCount = items.filter((i) => i.status === "failed").length
  const processedCount = doneCount + failedCount
  const totalCount = items.length
  const progress = totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0
  const hasAnyResult = items.some((i) => i.status === "done" || i.status === "failed")
  const stoppedCount = items.filter((i) => i.status === "stopped" || i.status === "failed").length
  const pendingCount = items.filter((i) => i.status === "pending").length
  const canSave = Boolean(user?.hasPurchasedCredits)
  const creditLimit = canSave
    ? Math.floor((user?.credits || 0) / (user?.creditsPerDocument || 2))
    : Infinity

  // ── file management ───────────────────────────────────────────────────────

  function stageFiles(files: FileList | File[]) {
    const { acceptedFiles, rejectedCount: rc } = collectPdfFiles(files)
    if (acceptedFiles.length === 0) {
      setRejectedCount(rc)
      return
    }

    // Guests: exactly 1 PDF at a time — replace any existing staged file
    if (!user) {
      const single = acceptedFiles[0]
      setItems([{
        uid: `${single.name}-${single.lastModified}-${Math.random()}`,
        file: single,
        status: "pending" as FileItemStatus,
      }])
      setRejectedCount(rc)
      setConversionError(
        acceptedFiles.length > 1
          ? "Guests can only convert 1 PDF at a time. Sign up free to upload multiple files."
          : null
      )
      setPhase("staging")
      return
    }

    setItems((prev) => {
      const existingNames = new Set(prev.map((i) => i.file.name))
      const newItems: ConversionItem[] = acceptedFiles
        .filter((f) => !existingNames.has(f.name))
        .map((f) => ({
          uid: `${f.name}-${f.lastModified}-${Math.random()}`,
          file: f,
          status: "pending" as FileItemStatus,
        }))
      return [...prev, ...newItems]
    })
    setRejectedCount(rc)
    setConversionError(null)
    setPhase("staging")
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) stageFiles(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) stageFiles(e.dataTransfer.files)
  }

  function removeItem(uid: string) {
    setItems((prev) => {
      const item = prev.find((i) => i.uid === uid)
      if (item?.status === "processing") return prev
      const url = blobUrlsRef.current.get(uid)
      if (url) {
        URL.revokeObjectURL(url)
        blobUrlsRef.current.delete(uid)
      }
      const poll = pollIntervalRef.current.get(uid)
      if (poll) {
        clearInterval(poll)
        pollIntervalRef.current.delete(uid)
      }
      const next = prev.filter((i) => i.uid !== uid)
      if (next.length === 0 && phase !== "processing") setPhase("idle")
      return next
    })
  }

  function openPdfPreview(item: ConversionItem) {
    if (item.isRestored) return
    let url = blobUrlsRef.current.get(item.uid)
    if (!url) {
      url = URL.createObjectURL(item.file)
      blobUrlsRef.current.set(item.uid, url)
    }
    window.open(url, "_blank", "noopener,noreferrer")
  }

  function togglePreview(uid: string) {
    setItems((prev) =>
      prev.map((i) => (i.uid === uid ? { ...i, showPreview: !i.showPreview } : i))
    )
  }

  // ── downloads ─────────────────────────────────────────────────────────────

  async function downloadFile(jobId: string, format: "csv" | "xlsx" | "zip", baseName: string) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/convert/${jobId}/download?format=${format}`,
        { credentials: "include" }
      )
      if (!res.ok) return
      const blob = await res.blob()
      const ext = format === "xlsx" ? "xlsx" : format
      triggerDownload(blob, `${baseName}.${ext}`)
    } catch {
      // silently ignore
    }
  }

  async function downloadAllZip() {
    const doneJobIds = items
      .filter((i) => i.status === "done" && i.jobId)
      .map((i) => i.jobId!)
    if (doneJobIds.length === 0) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/convert/bulk-download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ jobIds: doneJobIds }),
      })
      if (!res.ok) return
      const blob = await res.blob()
      triggerDownload(blob, "converted-statements.zip")
    } catch {
      // silently ignore
    }
  }

  // ── save to library ───────────────────────────────────────────────────────

  async function saveToLibrary(uid: string) {
    const item = items.find((i) => i.uid === uid)
    if (!item || item.saving || item.saved || item.isRestored) return
    setItems((prev) => prev.map((i) => (i.uid === uid ? { ...i, saving: true } : i)))
    try {
      const formData = new FormData()
      formData.append("documents", item.file)
      const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || "Could not save PDF")
      }
      setItems((prev) =>
        prev.map((i) => (i.uid === uid ? { ...i, saving: false, saved: true } : i))
      )
      refreshUser()
    } catch (err) {
      setItems((prev) => prev.map((i) => (i.uid === uid ? { ...i, saving: false } : i)))
      setConversionError(err instanceof Error ? err.message : "Could not save PDF")
    }
  }

  // ── polling ───────────────────────────────────────────────────────────────

  function pollJobUntilDone(uid: string, jobId: string): Promise<void> {
    return new Promise<void>((resolve) => {
      let settled = false
      const settle = () => {
        if (settled) return
        settled = true
        // Remove from resolver registry
        const idx = pollResolversRef.current.indexOf(settle)
        if (idx > -1) pollResolversRef.current.splice(idx, 1)
        resolve()
      }

      // Register so handleCancel can resolve this promise immediately
      pollResolversRef.current.push(settle)

      const interval = setInterval(async () => {
        if (cancelledRef.current) {
          clearInterval(interval)
          pollIntervalRef.current.delete(uid)
          settle()
          return
        }
        try {
          const res = await fetch(
            `${API_BASE_URL}/api/convert/${jobId}/status`,
            { credentials: "include" }
          )
          const data = await res.json().catch(() => null)
          if (!data?.success) return

          if (data.status === "done" || data.status === "failed") {
            clearInterval(interval)
            pollIntervalRef.current.delete(uid)
            setItems((prev) =>
              prev.map((i) =>
                i.uid === uid
                  ? {
                      ...i,
                      status: data.status === "done" ? "done" : "failed",
                      jobId: data.jobId,
                      bankName: data.bankName,
                      statementPeriod: data.statementPeriod,
                      pageCount: data.pageCount ?? 0,
                      rowCount: data.rowCount ?? 0,
                      rows: data.rows ?? [],
                      error: data.error,
                      showPreview: false,
                    }
                  : i
              )
            )
            settle()
          }
        } catch {
          // keep polling on transient errors
        }
      }, 2500)

      pollIntervalRef.current.set(uid, interval)
    })
  }

  // ── processing loop ───────────────────────────────────────────────────────

  async function runProcessing(pendingItems: ConversionItem[]) {
    if (isProcessingRef.current || pendingItems.length === 0) return
    isProcessingRef.current = true
    stopRef.current = false
    cancelledRef.current = false
    setPhase("processing")

    const pollPromises: Promise<void>[] = []

    for (const item of pendingItems) {
      if (stopRef.current || cancelledRef.current) break

      setItems((prev) =>
        prev.map((i) => (i.uid === item.uid ? { ...i, status: "processing" } : i))
      )

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const formData = new FormData()
        formData.append("files", item.file)
        const res = await fetch(`${API_BASE_URL}/api/convert`, {
          method: "POST",
          credentials: "include",
          body: formData,
          signal: controller.signal,
        })
        const data = await res.json().catch(() => null)
        if (!res.ok) throw new Error(data?.message || "Upload failed")

        const job = data?.jobs?.[0]
        if (!job?.jobId) throw new Error("No job ID returned")

        // Update with jobId immediately and start background poll
        setItems((prev) =>
          prev.map((i) =>
            i.uid === item.uid ? { ...i, status: "processing", jobId: job.jobId } : i
          )
        )
        pollPromises.push(pollJobUntilDone(item.uid, job.jobId))
      } catch (err) {
        if (!cancelledRef.current) {
          setItems((prev) =>
            prev.map((i) =>
              i.uid === item.uid
                ? {
                    ...i,
                    status: "failed",
                    error: err instanceof Error ? err.message : "Upload failed",
                  }
                : i
            )
          )
        }
      }
    }

    abortRef.current = null

    if (cancelledRef.current) {
      pollIntervalRef.current.forEach((id) => clearInterval(id))
      pollIntervalRef.current.clear()
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      blobUrlsRef.current.clear()
      setItems([])
      setPhase("idle")
      isProcessingRef.current = false
    } else {
      // Wait for all background polls to complete (or be cancelled)
      if (pollPromises.length > 0) {
        await Promise.all(pollPromises)
      }

      // Re-check: cancel may have been pressed while polls were running
      if (cancelledRef.current) {
        blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
        blobUrlsRef.current.clear()
        setItems([])
        setPhase("idle")
      } else {
        setItems((prev) =>
          prev.map((i) => (i.status === "pending" ? { ...i, status: "stopped" } : i))
        )
        setPhase("done")
      }
      isProcessingRef.current = false
    }

    cancelledRef.current = false
    stopRef.current = false
  }

  function handleConvert() {
    const pending = items.filter((i) => i.status === "pending")
    if (pending.length === 0) return

    // If the user has purchased credits but uploaded more PDFs than they can save,
    // mark the over-limit items and show the credit dialog before proceeding
    if (canSave && isFinite(creditLimit) && pending.length > creditLimit) {
      setItems((prev) =>
        prev.map((item, index) => ({ ...item, overCreditLimit: index >= creditLimit }))
      )
      setShowCreditDialog(true)
      return
    }

    void runProcessing(pending)
  }

  function handleContinueWithCreditLimit() {
    setShowCreditDialog(false)
    const pending = items.filter((i) => i.status === "pending")
    void runProcessing(pending)
  }

  function handleCloseCreditDialog() {
    setShowCreditDialog(false)
    setItems((prev) => prev.map((item) => ({ ...item, overCreditLimit: false })))
  }

  function handleStop() {
    stopRef.current = true
  }

  function handleCancel() {
    cancelledRef.current = true
    abortRef.current?.abort()
    // Immediately stop all active polls and resolve their promises so
    // runProcessing can resume and clean up without waiting for the next tick
    pollIntervalRef.current.forEach((id) => clearInterval(id))
    pollIntervalRef.current.clear()
    const resolvers = pollResolversRef.current.splice(0)
    resolvers.forEach((res) => res())
  }

  function handleReset() {
    if (autoResetTimerRef.current) {
      clearInterval(autoResetTimerRef.current)
      autoResetTimerRef.current = null
    }
    pollIntervalRef.current.forEach((id) => clearInterval(id))
    pollIntervalRef.current.clear()
    pollResolversRef.current.splice(0)
    blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    blobUrlsRef.current.clear()
    setItems([])
    setPhase("idle")
    setConversionError(null)
    setRejectedCount(0)
    setAutoResetCountdown(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function cancelAutoReset() {
    if (autoResetTimerRef.current) {
      clearInterval(autoResetTimerRef.current)
      autoResetTimerRef.current = null
    }
    setAutoResetCountdown(null)
  }

  async function restartItem(uid: string) {
    const item = items.find((i) => i.uid === uid)
    if (!item || item.status === "processing" || isProcessingRef.current) return
    const fresh: ConversionItem = { uid: item.uid, file: item.file, status: "pending" }
    setItems((prev) => prev.map((i) => (i.uid === uid ? fresh : i)))
    await runProcessing([fresh])
  }

  async function resumeAll() {
    if (isProcessingRef.current) return
    const toResume = items
      .filter((i) => i.status === "stopped" || i.status === "failed")
      .map((i) => ({ ...i, status: "pending" as FileItemStatus }))
    if (toResume.length === 0) return
    setItems((prev) => {
      return prev.map((i) => {
        const r = toResume.find((r) => r.uid === i.uid)
        return r ?? i
      })
    })
    await runProcessing(toResume)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      <div
        id="upload"
        className="relative overflow-hidden rounded-[36px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(244,250,248,0.98)_100%)] p-5 shadow-[0_36px_96px_-68px_rgba(15,23,42,0.45)] ring-1 ring-foreground/6 sm:p-7"
      >
        <div className="pointer-events-none absolute -right-12 top-0 h-40 w-40 rounded-full bg-[#5eead4]/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-[#bfdbfe]/30 blur-3xl" />

        {/* ── Credit limit dialog overlay ── */}
        {showCreditDialog && isFinite(creditLimit) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-[36px] bg-black/40 p-6 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[24px] border border-amber-200 bg-white p-6 shadow-[0_36px_96px_-48px_rgba(15,23,42,0.55)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
                Credit limit
              </p>
              <p className="mt-3 font-heading text-xl font-semibold text-foreground">
                Not enough credits for all PDFs
              </p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                You have{" "}
                <strong className="text-foreground">{user?.credits} credits</strong>,
                enough to save{" "}
                <strong className="text-foreground">
                  {creditLimit} PDF{creditLimit === 1 ? "" : "s"}
                </strong>
                . You uploaded{" "}
                <strong className="text-foreground">
                  {items.length} PDF{items.length === 1 ? "" : "s"}
                </strong>
                .
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                The first {creditLimit} PDFs (highlighted above) can be saved to your
                library. The remaining {items.length - creditLimit} will convert but
                won&apos;t be saveable without more credits.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleContinueWithCreditLimit}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "w-full rounded-[12px]"
                  )}
                >
                  Continue anyway
                  <ArrowRight className="size-4" />
                </button>
                <Link
                  href="/pricing"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "w-full rounded-[12px]"
                  )}
                >
                  Buy more credits
                </Link>
                <button
                  type="button"
                  onClick={handleCloseCreditDialog}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "w-full rounded-[12px] text-muted-foreground"
                  )}
                >
                  Modify selection
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="relative space-y-5">

          {/* ── Header ── */}
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
                  Upload lane
                </p>
                <h3 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-foreground">
                  Drop your bank statement PDFs here
                </h3>
              </div>
              {(phase === "done" || (phase === "processing" && hasAnyResult)) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-full border-foreground/10 bg-white"
                  )}
                >
                  <X className="size-3.5" />
                  Convert more
                </button>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#99f6e4] bg-[#ecfeff] px-3 py-1 text-xs font-medium text-[#0f766e]">
                PDF only
              </span>
              <span className="rounded-full border border-foreground/10 bg-white px-3 py-1 text-xs font-medium text-muted-foreground">
                Multi-file ready
              </span>
              <span className="rounded-full border border-foreground/10 bg-white px-3 py-1 text-xs font-medium text-muted-foreground">
                CSV · XLSX · ZIP
              </span>
            </div>
          </div>

          {/* ── STAGING PHASE ── */}
          {(phase === "idle" || phase === "staging") && (
            <>
              {/* Drop zone */}
              <input
                id={inputId}
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                multiple
                className="sr-only"
                onChange={handleInputChange}
              />
              <label
                htmlFor={inputId}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = "copy"
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  "flex min-h-[220px] w-full cursor-pointer flex-col items-center justify-center rounded-[30px] border border-dashed border-[#99f6e4] bg-[#f7fffd] px-6 py-8 text-center transition-all",
                  isDragging && "border-[#0f766e] bg-[#ecfeff] shadow-[0_20px_48px_-36px_rgba(15,118,110,0.65)]"
                )}
              >
                <span className="flex size-14 items-center justify-center rounded-[20px] bg-white text-[#0f766e] shadow-[0_18px_38px_-26px_rgba(15,118,110,0.42)] ring-1 ring-[#99f6e4]">
                  <Upload className="size-6" />
                </span>
                <p className="mt-4 font-heading text-xl font-semibold tracking-tight text-foreground">
                  Choose files or drag them here
                </p>
                <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">
                  {user
                    ? "Drop one statement or a whole batch — up to 20 PDFs at once."
                    : "Drop 1 PDF to try it out. Sign up free to process multiple files."}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <span className={cn(buttonVariants({ size: "lg" }), "rounded-full px-5 shadow-[0_18px_40px_-28px_rgba(15,118,110,0.8)]")}>
                    Choose PDF files
                  </span>
                  <span className="rounded-full border border-foreground/10 bg-white px-4 py-2 text-sm font-medium text-muted-foreground">
                    Multiple files supported
                  </span>
                </div>
              </label>

              {/* Staged files list */}
              {items.length > 0 ? (
                <div className="rounded-[28px] border border-foreground/8 bg-white/92 p-5 shadow-[0_20px_52px_-38px_rgba(15,23,42,0.28)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">Batch staging</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {pendingCount} file{pendingCount === 1 ? "" : "s"} ready to convert
                      </p>
                    </div>
                    <label
                      htmlFor={inputId}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "cursor-pointer rounded-full border-foreground/10 bg-white"
                      )}
                    >
                      <Upload className="size-3.5" />
                      Add more
                    </label>
                  </div>

                  <div className="mt-4 space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.uid}
                        className={cn(
                          "flex items-center gap-3 rounded-[20px] border p-3",
                          item.overCreditLimit
                            ? "border-amber-200 bg-amber-50"
                            : "border-foreground/8 bg-[#f8faf8]"
                        )}
                      >
                        <span className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-xl",
                          item.overCreditLimit
                            ? "bg-amber-100 text-amber-600"
                            : "bg-[#ecfeff] text-[#0f766e]"
                        )}>
                          <FileText className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{item.file.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{formatFileSize(item.file.size)}</p>
                          {item.overCreditLimit && (
                            <p className="mt-0.5 text-xs font-medium text-amber-600">
                              Needs more credits to save
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            type="button"
                            title="Preview PDF"
                            onClick={() => openPdfPreview(item)}
                            className="flex size-8 items-center justify-center rounded-full border border-foreground/10 bg-white text-muted-foreground transition-colors hover:border-[#0f766e] hover:text-[#0f766e]"
                          >
                            <Eye className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Remove"
                            onClick={() => removeItem(item.uid)}
                            className="flex size-8 items-center justify-center rounded-full border border-foreground/10 bg-white text-muted-foreground transition-colors hover:border-red-300 hover:text-red-500"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {rejectedCount > 0 && (
                    <p className="mt-3 text-xs font-medium text-[#b45309]">
                      {rejectedCount} non-PDF file{rejectedCount === 1 ? " was" : "s were"} ignored.
                    </p>
                  )}

                  {conversionError && (
                    <div className="mt-4 rounded-[18px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#991b1b]">
                      {conversionError}
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                      Converts to CSV and Excel — free, no account required.
                    </p>
                    <button
                      type="button"
                      onClick={handleConvert}
                      disabled={pendingCount === 0}
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "rounded-full px-6 shadow-[0_18px_40px_-28px_rgba(15,118,110,0.8)] disabled:translate-y-0"
                      )}
                    >
                      Convert to CSV / Excel
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty staging area */
                <div className="rounded-[28px] border border-foreground/8 bg-white/92 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                      Your selected PDFs will appear here before conversion starts.
                    </p>
                    <span className="rounded-full border border-foreground/10 bg-[#f8faf8] px-3 py-1 text-xs font-medium text-muted-foreground">
                      No files selected
                    </span>
                  </div>
                  {conversionError && (
                    <div className="mt-3 rounded-[18px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#991b1b]">
                      {conversionError}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── PROCESSING / DONE PHASE ── */}
          {(phase === "processing" || phase === "done") && (
            <div className="space-y-4">

              {/* Progress bar — processing only */}
              {phase === "processing" && (
                <div className="rounded-[22px] border border-foreground/8 bg-white/92 p-5 shadow-[0_14px_40px_-28px_rgba(15,23,42,0.18)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {processedCount} / {totalCount} converted
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {progress}% complete
                        {failedCount > 0 ? ` · ${failedCount} failed` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleStop}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "rounded-full border-foreground/10 bg-white"
                        )}
                      >
                        <Square className="size-3.5" />
                        Stop
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "rounded-full border-red-200 bg-white text-red-600 hover:bg-red-50"
                        )}
                      >
                        <X className="size-3.5" />
                        Cancel all
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-foreground/8">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#14b8a6_0%,#67e8f9_100%)] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Auto-clear countdown */}
              {phase === "done" && autoResetCountdown !== null && (
                <div className="flex items-center justify-between gap-3 rounded-[18px] border border-foreground/8 bg-[#f8faf8] px-4 py-2.5">
                  <p className="text-xs text-muted-foreground">
                    Results auto-clear in{" "}
                    <strong className="text-foreground">{autoResetCountdown}s</strong>
                  </p>
                  <button
                    type="button"
                    onClick={cancelAutoReset}
                    className="text-xs font-medium text-[#0f766e] hover:underline"
                  >
                    Keep results
                  </button>
                </div>
              )}

              {/* Bulk download + resume */}
              {doneCount >= 2 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[#99f6e4] bg-[#f0fdfa] px-5 py-3">
                  <p className="text-sm font-medium text-[#0f766e]">
                    {doneCount} file{doneCount === 1 ? "" : "s"} converted successfully
                  </p>
                  <div className="flex items-center gap-2">
                    {phase === "done" && stoppedCount > 0 && (
                      <button
                        type="button"
                        onClick={resumeAll}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "rounded-full border-foreground/10 bg-white"
                        )}
                      >
                        <RefreshCw className="size-3.5" />
                        Resume all
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={downloadAllZip}
                      className={cn(buttonVariants({ size: "sm" }), "rounded-full px-4")}
                    >
                      <Download className="size-3.5" />
                      Download all as ZIP
                    </button>
                  </div>
                </div>
              )}

              {/* Items list */}
              {items.map((item) => {
                const baseName = item.file.name.replace(/\.pdf$/i, "")
                return (
                  <div
                    key={item.uid}
                    className={cn(
                      "rounded-[28px] border p-5 shadow-[0_20px_52px_-38px_rgba(15,23,42,0.24)]",
                      item.overCreditLimit
                        ? "border-amber-200 bg-amber-50/60"
                        : "border-foreground/8 bg-white/92"
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      {/* File info */}
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
                            item.status === "done" && "bg-[#ecfeff] text-[#0f766e]",
                            item.status === "failed" && "bg-[#fff1f2] text-red-500",
                            item.status === "processing" && "bg-[#ecfeff] text-[#0f766e]",
                            (item.status === "pending" || item.status === "stopped") && "bg-[#f8faf8] text-muted-foreground"
                          )}
                        >
                          {item.status === "processing" ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <FileText className="size-4" />
                          )}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.file.name}</p>
                          {item.status === "done" && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {item.rowCount} transaction{item.rowCount === 1 ? "" : "s"} found
                              {item.bankName ? ` · ${item.bankName}` : ""}
                              {item.pageCount ? ` · ${item.pageCount} page${item.pageCount === 1 ? "" : "s"}` : ""}
                            </p>
                          )}
                          {item.status === "processing" && (
                            <p className="mt-0.5 text-xs text-muted-foreground">Processing on server…</p>
                          )}
                          {item.status === "pending" && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="size-3" /> Waiting…
                            </p>
                          )}
                          {item.status === "stopped" && (
                            <p className="mt-0.5 text-xs text-muted-foreground">Stopped</p>
                          )}
                          {item.status === "failed" && (
                            <p className="mt-0.5 text-xs text-red-500">
                              {item.error || "Conversion failed"}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Done: preview + download + save */}
                        {item.status === "done" && (
                          <>
                            {/* Preview — only when we have rows */}
                            {(item.rows?.length ?? 0) > 0 && (
                              <button
                                type="button"
                                onClick={() => togglePreview(item.uid)}
                                className={cn(
                                  buttonVariants({ variant: "outline", size: "sm" }),
                                  "rounded-full border-foreground/10 bg-white"
                                )}
                              >
                                {item.showPreview ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                                {item.showPreview ? "Hide" : "Preview"}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => downloadFile(item.jobId!, "csv", baseName)}
                              className={cn(
                                buttonVariants({ variant: "outline", size: "sm" }),
                                "rounded-full border-foreground/10 bg-white"
                              )}
                            >
                              <Download className="size-3.5" />
                              CSV
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadFile(item.jobId!, "xlsx", baseName)}
                              className={cn(
                                buttonVariants({ variant: "outline", size: "sm" }),
                                "rounded-full border-foreground/10 bg-white"
                              )}
                            >
                              <Download className="size-3.5" />
                              Excel
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadFile(item.jobId!, "zip", baseName)}
                              className={cn(buttonVariants({ size: "sm" }), "rounded-full px-4")}
                            >
                              <Download className="size-3.5" />
                              ZIP
                            </button>
                            {/* Save to library — paid accounts, not restored, not over credit limit */}
                            {canSave && !item.isRestored && !item.overCreditLimit && (
                              <button
                                type="button"
                                onClick={() => saveToLibrary(item.uid)}
                                disabled={item.saving || item.saved}
                                title={item.saved ? "Saved to library" : "Save PDF to library"}
                                className={cn(
                                  buttonVariants({ variant: "outline", size: "sm" }),
                                  "rounded-full border-foreground/10 bg-white",
                                  item.saved && "border-[#99f6e4] text-[#0f766e]"
                                )}
                              >
                                {item.saving ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : item.saved ? (
                                  <BookmarkCheck className="size-3.5" />
                                ) : (
                                  <Bookmark className="size-3.5" />
                                )}
                                {item.saved ? "Saved" : "Save"}
                              </button>
                            )}
                          </>
                        )}

                        {/* Stopped / failed: retry (not for restored items without real file) */}
                        {(item.status === "stopped" || item.status === "failed") && !item.isRestored && (
                          <button
                            type="button"
                            onClick={() => restartItem(item.uid)}
                            disabled={isProcessingRef.current}
                            className={cn(
                              buttonVariants({ variant: "outline", size: "sm" }),
                              "rounded-full border-foreground/10 bg-white"
                            )}
                          >
                            <RefreshCw className="size-3.5" />
                            Retry
                          </button>
                        )}

                        {/* Delete — everything except currently-processing item */}
                        {item.status !== "processing" && (
                          <button
                            type="button"
                            onClick={() => removeItem(item.uid)}
                            title="Remove"
                            className="flex size-8 items-center justify-center rounded-full border border-foreground/10 bg-white text-muted-foreground transition-colors hover:border-red-300 hover:text-red-500"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Zero-transaction warning */}
                    {item.status === "done" && item.rowCount === 0 && (
                      <div className="mt-4 rounded-[18px] border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-sm text-[#92400e]">
                        No transactions were detected. This can happen with scanned (image-based) PDFs
                        or heavily custom formats. Try a text-selectable version of the statement.
                      </div>
                    )}

                    {/* Preview table */}
                    {item.showPreview && item.rows && item.rows.length > 0 && (
                      <TransactionTable rows={item.rows} />
                    )}
                  </div>
                )
              })}

              {conversionError && (
                <div className="rounded-[18px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#991b1b]">
                  {conversionError}
                </div>
              )}

              {/* Library CTA for signed-in users */}
              {user && hasAnyResult && (
                <div className="rounded-[22px] border border-foreground/8 bg-[#f8faf8] p-4 text-sm text-muted-foreground">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p>
                      {canSave ? (
                        <>
                          <span className="font-medium text-foreground">
                            {user.credits} credit{user.credits === 1 ? "" : "s"} remaining
                          </span>{" "}
                          · 2 credits per PDF saved to library.
                        </>
                      ) : (
                        <>
                          Want to save the original PDFs to your library?{" "}
                          <span className="font-medium text-foreground">
                            {user.credits} credit{user.credits === 1 ? "" : "s"} remaining · 2 per PDF.
                          </span>
                        </>
                      )}
                    </p>
                    <Link
                      href="/documents"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "rounded-full border-foreground/10 bg-white"
                      )}
                    >
                      PDF library
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Access plan cards */}
      <div className="grid auto-rows-fr gap-4 lg:grid-cols-3">
        {uploadAccessPlans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "group relative flex h-full flex-col overflow-hidden rounded-[30px] border p-6 shadow-[0_28px_80px_-54px_rgba(15,23,42,0.24)] transition-transform duration-200",
              plan.featured
                ? "border-[#99f6e4] bg-[linear-gradient(180deg,#ffffff_0%,#eefcf8_58%,#ecfeff_100%)]"
                : "border-foreground/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,250,248,0.98)_100%)]"
            )}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(103,232,249,0.12)_0%,rgba(103,232,249,0)_100%)]" />

            <div className="flex items-start justify-between gap-3">
              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  {plan.eyebrow}
                </p>
                <p className="mt-3 font-heading text-2xl font-semibold tracking-tight text-foreground">
                  {plan.name}
                </p>
              </div>
              <div className="relative flex items-center gap-2">
                {plan.featured && (
                  <span className="rounded-full border border-[#99f6e4] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0f766e]">
                    Recommended
                  </span>
                )}
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-2xl border",
                    plan.featured
                      ? "border-[#99f6e4] bg-white text-[#0f766e]"
                      : "border-foreground/8 bg-[#f7fffd] text-[#0f766e]"
                  )}
                >
                  <plan.icon className="size-5" />
                </span>
              </div>
            </div>

            <p className="mt-5 min-h-[84px] text-sm leading-7 text-muted-foreground">
              {plan.description}
            </p>

            <div
              className={cn(
                "mt-6 rounded-[24px] border p-5",
                plan.featured ? "border-[#99f6e4] bg-white/80" : "border-foreground/8 bg-[#f8faf8]"
              )}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Daily conversion room
              </p>
              <div className="mt-4 flex items-end gap-2">
                <span className="font-heading text-5xl font-semibold leading-none tracking-tight text-foreground">
                  {plan.pages}
                </span>
                <span className="pb-1 text-base font-medium text-foreground">{plan.unit}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.window}</p>
              <div className="mt-5 h-2 rounded-full bg-foreground/6">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#14b8a6_0%,#67e8f9_100%)]"
                  style={{ width: plan.meterWidth }}
                />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {plan.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="flex items-start gap-3 rounded-[18px] border border-transparent px-1 py-1 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0f766e]" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto flex items-end justify-between gap-4 pt-6">
              <div>
                <p className="font-heading text-3xl font-semibold tracking-tight text-foreground">
                  {plan.price}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{plan.footer}</p>
              </div>
              {plan.href ? (
                <Link
                  href={plan.href}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-full border-foreground/10 bg-white"
                  )}
                >
                  {plan.actionLabel}
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <span className="rounded-full border border-foreground/10 bg-white px-4 py-2 text-sm font-medium text-muted-foreground">
                  {plan.actionLabel}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
