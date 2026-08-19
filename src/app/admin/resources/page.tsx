import type { Metadata } from "next";
import { listResources } from "@/lib/resources-db";
import { AdminResourcesTable } from "@/components/admin/admin-resources-table";

export const metadata: Metadata = {
  title: "Manage Resources | Admin Portal",
};

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const resources = await listResources();

  return <AdminResourcesTable resources={resources} />;
}
