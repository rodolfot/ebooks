import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/cliente/ProfileForm"
import { ReferralSection } from "@/components/cliente/ReferralSection"

export const dynamic = "force-dynamic"

export const metadata = { title: "Configurações" }

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, cpf: true, image: true, referralCode: true },
  })

  if (!user) redirect("/login")

  const [referralCount, completedCount] = await Promise.all([
    prisma.referral.count({ where: { referrerId: session.user.id } }),
    prisma.referral.count({ where: { referrerId: session.user.id, status: "completed" } }),
  ])

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl font-bold">Configurações</h1>
      <ProfileForm user={user} />
      {user.referralCode && (
        <ReferralSection
          referralCode={user.referralCode}
          referralCount={referralCount}
          completedCount={completedCount}
        />
      )}
    </div>
  )
}
