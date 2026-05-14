import { AuthPage } from "@/components/auth/auth-page"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ authError?: string }>
}) {
  const params = await searchParams

  return <AuthPage mode="register" authError={params.authError ?? null} />
}
