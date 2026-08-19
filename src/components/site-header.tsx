"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CloseIcon, MenuIcon } from "./icons";

const NAV_LINKS = [
  { label: "Hackathons", href: "/" },
  { label: "Communities", href: "/communities" },
  { label: "Resources", href: "/resources" },
  { label: "Support", href: "/support" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/hackathons");
  return pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Admin portal has its own sidebar layout — hide the public header.
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-edge-soft bg-ink/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/images/logos/jkuat-logo.png"
            alt="JKUAT Logo"
            width={36}
            height={36}
            className="h-9 w-auto shrink-0"
            priority
          />
          <Image
            src="/images/logos/jhub-logo.png"
            alt="JHUB Africa Logo"
            width={36}
            height={36}
            className="h-9 w-auto shrink-0"
            priority
          />
          <span className="font-display text-lg font-bold tracking-tight text-white sm:hidden">
            JHUB Africa
          </span>
          <span className="hidden font-display text-lg font-bold tracking-tight text-white sm:inline">
            JHUB Africa Hackathons
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`pb-0.5 text-sm transition-colors ${
                  active
                    ? "border-b-2 border-rose font-medium text-white"
                    : "text-mist hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-sm text-mist transition-colors hover:text-white">
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-rose px-4 py-2 text-sm font-semibold text-[#2a1414] transition-opacity hover:opacity-90"
          >
            Register
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="rounded-md p-2 text-mist hover:text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav panel */}
      {open && (
        <nav className="border-t border-edge-soft bg-ink px-4 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm ${
                    active ? "bg-panel font-medium text-white" : "text-mist hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-3 border-t border-edge-soft pt-4">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg border border-edge px-4 py-2.5 text-center text-sm text-mist hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg bg-rose px-4 py-2.5 text-center text-sm font-semibold text-[#2a1414]"
            >
              Register
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
