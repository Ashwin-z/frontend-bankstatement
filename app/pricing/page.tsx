import { PricingPage } from "@/components/pricing/pricing-page"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>
}) {
  const params = await searchParams

  return <PricingPage checkoutStatus={params.checkout ?? null} />
}
