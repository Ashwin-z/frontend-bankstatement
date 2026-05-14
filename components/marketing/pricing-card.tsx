import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { PricingPlan } from "@/components/home/home-content"
import { cn } from "@/lib/utils"

type PricingCardProps = {
  plan: PricingPlan
}

export function PricingCard({ plan }: PricingCardProps) {
  return (
    <Card
      className={cn(
        "rounded-[28px] border border-foreground/10 bg-white/90 py-0 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.32)]",
        plan.featured &&
          "border-[#0f766e]/20 bg-[linear-gradient(180deg,rgba(15,118,110,0.06)_0%,rgba(255,255,255,0.98)_38%)]"
      )}
    >
      <CardHeader className="px-6 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0f766e]">
              {plan.badge}
            </p>
            <CardTitle className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground">
              {plan.name}
            </CardTitle>
            <CardDescription className="mt-3 text-sm leading-7 text-muted-foreground">
              {plan.fitLabel}
            </CardDescription>
          </div>

          {plan.featured ? (
            <span className="rounded-full border border-[#99f6e4] bg-[#ecfeff] px-3 py-1 text-xs font-semibold text-[#0f766e]">
              Recommended
            </span>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <div className="rounded-[22px] border border-foreground/8 bg-[#f8faf8] p-5">
          <p className="text-sm font-medium text-muted-foreground">Billing model</p>
          <p className="mt-2 font-heading text-2xl font-semibold tracking-tight text-foreground">
            {plan.billing}
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {plan.description}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {plan.bullets.map((bullet) => (
            <div key={bullet} className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 size-4 text-[#0f766e]" />
              <p className="text-sm leading-7 text-foreground">{bullet}</p>
            </div>
          ))}
        </div>

        <Link
          href={plan.ctaHref}
          className={cn(
            buttonVariants({
              variant: plan.featured ? "default" : "outline",
              size: "lg",
            }),
            "mt-8 w-full rounded-full px-5",
            plan.featured &&
              "bg-[linear-gradient(135deg,#12314d_0%,#0f766e_100%)] text-white hover:opacity-95"
          )}
        >
          {plan.ctaLabel}
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  )
}
