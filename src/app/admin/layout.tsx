import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata: Metadata = {
  title: "Admin Portal | JHUB Africa Hackathons",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-ink">
      <AdminSidebar />
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
