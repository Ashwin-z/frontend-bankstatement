import Link from "next/link"

type NavItem = {
  href: string
  label: string
}

type SiteFooterProps = {
  navItems: NavItem[]
}

export function SiteFooter({ navItems }: SiteFooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-foreground/10 bg-[#f4f5ef]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="font-medium text-foreground">
            © {year} BSC — Bank Statement Convertor
          </p>
          <p className="mt-1">
            bankstatementconvertor.io · Built for finance teams that need cleaner data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
