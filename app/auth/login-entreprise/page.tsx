import { redirect } from "next/navigation";

export default async function LoginEntrepriseAlias({ searchParams }: { searchParams: Promise<{ returnUrl?: string }> }) {
  const params = await searchParams;
  const suffix = params.returnUrl ? `?returnUrl=${encodeURIComponent(params.returnUrl)}` : "";
  redirect(`/auth/login-enterprise${suffix}`);
}
