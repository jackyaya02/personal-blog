import Link from "next/link";

interface FooterProps {
  name?: string;
  email?: string | null;
  socialLinks?: Array<{ platform: string; url: string }>;
}

export default function Footer({ name = "Your Name", email, socialLinks = [] }: FooterProps) {
  return (
    <footer className="border-t border-warm-200 bg-warm-100/50">
      <div className="container-main flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {name}. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          {socialLinks.map((link) => (
            <Link
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 transition-colors hover:text-gray-700"
            >
              {link.platform}
            </Link>
          ))}
          {email && (
            <>
              {socialLinks.length > 0 && <span className="text-gray-300">/</span>}
              <Link
                href={`mailto:${email}`}
                className="text-sm text-gray-500 transition-colors hover:text-gray-700"
              >
                Email
              </Link>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
