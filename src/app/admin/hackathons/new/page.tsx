import type { Metadata } from "next";
import { HackathonForm } from "@/components/admin/hackathon-form";

export const metadata: Metadata = { title: "Create Hackathon | Admin Portal" };

export default function NewHackathonPage() {
  return <HackathonForm />;
}
