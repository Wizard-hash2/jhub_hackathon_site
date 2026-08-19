"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createHackathonWithSponsors, slugify } from "@/lib/hackathons";
import type { SponsorInput } from "@/lib/hackathons";

export interface CreateHackathonFormData {
  title: string;
  slug: string;
  summary: string;
  description: string;
  theme: string;
  tags: string[];
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  locationType: "physical" | "virtual" | "hybrid";
  location: string;
  externalRegUrl: string;
  imageUrl: string;
  applicationMode: "individual" | "team";
  minTeamSize: number;
  maxTeamSize: number;
  sponsors: SponsorInput[];
}

export async function createHackathonAction(
  data: CreateHackathonFormData,
  publish: boolean,
) {
  const normalizedImageUrl = data.imageUrl.trim();

  if (normalizedImageUrl.startsWith("data:") || normalizedImageUrl.startsWith("blob:")) {
    throw new Error("Cover image must be a hosted URL. Data/blob image payloads are not supported.");
  }

  if (normalizedImageUrl.length > 512) {
    throw new Error("Cover image URL is too long. Please use a shorter hosted URL (max 512 chars).");
  }

  const slug = data.slug?.trim() || slugify(data.title);
  const created = await createHackathonWithSponsors(
    {
      slug,
      title: data.title,
      summary: data.summary,
      description: data.description,
      theme: data.theme,
      tags: data.tags,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      applicationDeadline: data.applicationDeadline || null,
      locationType: data.locationType,
      location: data.location,
      externalRegUrl: data.externalRegUrl,
      imageUrl: normalizedImageUrl,
      applicationMode: data.applicationMode,
      minTeamSize: data.minTeamSize,
      maxTeamSize: data.maxTeamSize,
      adminStatus: publish ? "published" : "draft",
      track: data.theme,
    },
    data.sponsors,
  );
  revalidatePath("/admin/hackathons");
  revalidatePath("/");
  redirect(`/admin/hackathons`);
}
