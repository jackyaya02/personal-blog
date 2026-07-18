import prisma from "@/lib/prisma";
import ProfileForm from "@/components/admin/ProfileForm";

export const dynamic = "force-dynamic";

async function getProfile() {
  return prisma.profile.findFirst();
}

export default async function AdminProfilePage() {
  const profile = await getProfile();
  return <ProfileForm profile={profile ?? undefined} />;
}
