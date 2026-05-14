import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  eyebrow: string
  title: string
  description: string
  align?: "left" | "center"
  className?: string
  titleClassName?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  titleClassName,
}: SectionHeadingProps) {
  const isCentered = align === "center"

  return (
    <div
      className={cn(
        "max-w-3xl",
        isCentered && "mx-auto text-center",
        className
      )}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0f766e]">
        {eyebrow}
      </p>
      <h2
        className={cn(
          "mt-4 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl",
          titleClassName
        )}
      >
        {title}
      </h2>
      <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
        {description}
      </p>
    </div>
  )
}
