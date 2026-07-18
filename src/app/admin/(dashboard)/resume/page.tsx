import prisma from "@/lib/prisma";
import ResumeEditor from "@/components/admin/ResumeEditor";

export const dynamic = "force-dynamic";

async function getData() {
  const profile = await prisma.profile.findFirst();
  if (!profile) return { resume: null };
  const resume = await prisma.resume.findUnique({
    where: { profileId: profile.id },
  });
  return { resume };
}

export default async function AdminResumePage() {
  const { resume } = await getData();
  return <ResumeEditor initialResume={(resume as any) ?? undefined} />;
}
