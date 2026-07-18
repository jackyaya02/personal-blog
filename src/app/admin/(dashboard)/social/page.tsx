import prisma from "@/lib/prisma";
import SocialLinksManager from "@/components/admin/SocialLinksManager";

export const dynamic = "force-dynamic";

async function getData() {
  const profile = await prisma.profile.findFirst();
  if (!profile) return { links: [] };
  const links = await prisma.socialLink.findMany({
    where: { profileId: profile.id },
    orderBy: { order: "asc" },
  });
  return { links };
}

export default async function AdminSocialPage() {
  const { links } = await getData();
  return <SocialLinksManager initialLinks={links} />;
}
