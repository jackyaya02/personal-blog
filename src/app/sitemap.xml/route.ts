import prisma from "@/lib/prisma";

export async function GET() {
  const [posts, projects] = await Promise.all([
    prisma.post.findMany({ where: { status: { in: ["PUBLISHED", "PINNED"] } }, select: { slug: true, updatedAt: true } }),
    prisma.project.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const pages = [
    { path: "/", lastModified: new Date() },
    { path: "/about", lastModified: new Date() },
    { path: "/resume", lastModified: new Date() },
    { path: "/projects", lastModified: new Date() },
    { path: "/blog", lastModified: new Date() },
    { path: "/contact", lastModified: new Date() },
  ];

  const postEntries = posts.map((post) => ({
    path: `/blog/${post.slug}`,
    lastModified: post.updatedAt,
  }));

  const projectEntries = projects.map((project) => ({
    path: `/projects/${project.slug}`,
    lastModified: project.updatedAt,
  }));

  const allEntries = [...pages, ...postEntries, ...projectEntries];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries
  .map(
    (entry) => `
  <url>
    <loc>${baseUrl}${entry.path}</loc>
    <lastmod>${entry.lastModified.toISOString()}</lastmod>
  </url>`
  )
  .join("")}
</urlset>`;

  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml" },
  });
}