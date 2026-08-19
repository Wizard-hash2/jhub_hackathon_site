"use server";

import { revalidatePath } from "next/cache";
import {
  deleteHackathon,
  duplicateHackathon,
  updateAdminStatus,
} from "@/lib/hackathons";
import type { AdminStatus } from "@/lib/hackathons";

export async function duplicateHackathonAction(id: number) {
  await duplicateHackathon(id);
  revalidatePath("/admin/hackathons");
  revalidatePath("/");
}

export async function deleteHackathonAction(id: number) {
  await deleteHackathon(id);
  revalidatePath("/admin/hackathons");
  revalidatePath("/");
}

export async function setAdminStatusAction(id: number, status: AdminStatus) {
  await updateAdminStatus(id, status);
  revalidatePath("/admin/hackathons");
  revalidatePath("/");
}
