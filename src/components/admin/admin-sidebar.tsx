"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { logoutAction } from "@/lib/auth-actions";
import {
  BookOpenIcon,
  CalendarCheckIcon,
  CogIcon,
  DashboardIcon,
  FileTextIcon,
  HelpCircleIcon,
  LogoutIcon,
  PlusIcon,
  UsersIcon,
} from "../icons";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <DashboardIcon className="h-5 w-5" /> },
  {
    label: "Manage Hackathons",
    href: "/admin/hackathons",
    icon: <CalendarCheckIcon className="h-5 w-5" />,
  },
  {
    label: "Manage Resources",
    href: "/admin/resources",
    icon: <BookOpenIcon className="h-5 w-5" />,
  },
  { label: "Participants", href: "/admin/participants", icon: <UsersIcon className="h-5 w-5" /> },
  { label: "Submissions", href: "/admin/submissions", icon: <FileTextIcon className="h-5 w-5" /> },
  { label: "Settings", href: "/admin/settings", icon: <CogIcon className="h-5 w-5" /> },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-edge-soft bg-panel md:flex">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-edge-soft px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky to-mint text-xs font-bold text-[#062a21]">
          🌍
        </div>
        <div className="leading-tight">
          <p className="font-display text-base font-bold text-white">Admin Portal</p>
          <p className="text-[11px] text-mist">JHUB Africa &amp; JKUAT</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-5">
        <Link
          href="/admin/hackathons/new"
          className="mb-3 flex items-center justify-center gap-2 rounded-lg bg-rose px-4 py-2.5 text-sm font-semibold text-[#2a1414] transition-opacity hover:opacity-90"
        >
          <PlusIcon className="h-4 w-4" />
          Create Hackathon
        </Link>

        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-sky/15 text-sky"
                  : "text-mist hover:bg-ink/40 hover:text-white"
              }`}
            >
              <span className={active ? "text-sky" : "text-fog"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-edge-soft px-3 py-4">
        <Link
          href="/support"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-mist transition-colors hover:bg-ink/40 hover:text-white"
        >
          <span className="text-fog">{<HelpCircleIcon className="h-5 w-5" />}</span>
          Help Center
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-mist transition-colors hover:bg-ink/40 hover:text-white"
          >
            <span className="text-fog">{<LogoutIcon className="h-5 w-5" />}</span>
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
