"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const FOOTER_LINKS = [
  { label: "Privacy Policy", href: "/support#privacy" },
  { label: "Terms of Service", href: "/support#terms" },
  { label: "Brand Assets", href: "/resources#brand" },
  { label: "Contact Us", href: "/support#contact" },
];

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-edge-soft">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <p className="font-display text-lg font-bold tracking-tight text-white">
          JHUB Africa &amp; JKUAT
        </p>

        <nav className="flex flex-wrap gap-x-6 gap-y-3">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs font-medium text-mist transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-sm text-mist">
          &copy; 2026 JHUB Africa &amp; JKUAT. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
