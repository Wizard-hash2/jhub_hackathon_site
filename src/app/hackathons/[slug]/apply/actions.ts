"use server";

import { revalidatePath } from "next/cache";
import { submitApplication, type ApplyInput, type ApplyResult } from "@/lib/applications";

export async function applyAction(input: ApplyInput): Promise<ApplyResult> {
  const result = await submitApplication(input);
  if (result.ok) {
    revalidatePath("/admin/participants");
    revalidatePath(`/hackathons/${input.hackathonSlug}`);
  }
  return result;
}
