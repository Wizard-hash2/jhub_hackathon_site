import type { Metadata } from "next";
import { ResourceForm } from "@/components/admin/resource-form";

export const metadata: Metadata = { title: "Add Resource | Admin Portal" };

export default function NewResourcePage() {
  return <ResourceForm />;
}
