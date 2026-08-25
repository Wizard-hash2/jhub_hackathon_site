"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SponsorInput } from "@/lib/hackathons";
import { slugify } from "@/lib/slugify";
import { createHackathonAction } from "@/app/admin/hackathons/new/actions";
import {
  BoldIcon,
  BuildingIcon,
  CalendarIcon,
  ChainIcon,
  GripIcon,
  ImageIcon,
  InfoIcon,
  ItalicIcon,
  LaptopIcon,
  LinkIcon,
  ListIcon,
  MapPin2Icon,
  PlusIcon,
  TagIcon,
  TrashIcon,
  UploadIcon,
  UsersIcon,
} from "../icons";

const AVAILABLE_THEMES = [
  "Web3",
  "AI / ML",
  "FinTech",
  "HealthTech",
  "AgriTech",
  "Climate",
  "Open Source",
  "EdTech",
];

type LocationType = "physical" | "virtual" | "hybrid";

interface FormState {
  title: string;
  slug: string;
  slugTouched: boolean;
  summary: string;
  description: string;
  theme: string;
  tags: string[];
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  locationType: LocationType;
  location: string;
  externalRegUrl: string;
  imageUrl: string;
  applicationMode: "individual" | "team";
  minTeamSize: number;
  maxTeamSize: number;
  sponsors: SponsorInput[];
}

const EMPTY: FormState = {
  title: "",
  slug: "",
  slugTouched: false,
  summary: "",
  description: "",
  theme: "Web3",
  tags: [],
  startDate: "",
  endDate: "",
  applicationDeadline: "",
  locationType: "physical",
  location: "",
  externalRegUrl: "",
  imageUrl: "",
  applicationMode: "individual",
  minTeamSize: 2,
  maxTeamSize: 5,
  sponsors: [{ name: "New Sponsor", logoUrl: "https://" }],
};

function SectionCard({
  icon,
  title,
  children,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-edge-soft bg-card p-5 sm:p-7 ${className}`}
    >
      <h2 className="mb-5 flex items-center gap-2.5 border-b border-edge-soft pb-4 font-display text-xl font-semibold text-white">
        <span className="text-sky">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function FieldLabel({
  children,
  required,
  htmlFor,
}: {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-mist">
      {children}
      {required && <span className="ml-0.5 text-rose">*</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-edge bg-panel px-3.5 py-2.5 text-sm text-white placeholder:text-fog focus:border-sky/60 focus:outline-none";

export function HackathonForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>("");
  const previewObjectUrlRef = useRef<string | null>(null);
  const [isPending, startSubmit] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value } as FormState;
      if (key === "title" && !f.slugTouched) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  function toggleTag(tag: string) {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));
  }

  function updateSponsor(index: number, key: keyof SponsorInput, value: string) {
    setForm((f) => ({
      ...f,
      sponsors: f.sponsors.map((s, i) => (i === index ? { ...s, [key]: value } : s)),
    }));
  }

  function addSponsor() {
    setForm((f) => ({
      ...f,
      sponsors: [...f.sponsors, { name: "New Sponsor", logoUrl: "https://" }],
    }));
  }

  function removeSponsor(index: number) {
    setForm((f) => ({
      ...f,
      sponsors: f.sponsors.filter((_, i) => i !== index),
    }));
  }

  async function handleFileChange(file: File | null) {
    if (!file) {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
        previewObjectUrlRef.current = null;
      }
      setCoverPreviewUrl("");
      return;
    }

    // Show immediate preview
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
    }
    const objectUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = objectUrl;
    setCoverPreviewUrl(objectUrl);

    // Upload to server
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || `Upload failed (${res.status}).`);
      }
      // Set the image URL from the server response
      update("imageUrl", data.url);
      // Clear the local preview since we now have the real URL
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
        previewObjectUrlRef.current = null;
      }
      setCoverPreviewUrl("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  async function submit(publish: boolean) {
    setError(null);
    const normalizedImageUrl = form.imageUrl.trim();

    if (!form.title.trim()) {
      setError("Hackathon title is required.");
      return;
    }
    if (!form.summary.trim()) {
      setError("Short summary is required.");
      return;
    }

    if (isUploading) {
      setError("Please wait for the image upload to finish.");
      return;
    }

    if (normalizedImageUrl.length > 512) {
      setError("Cover image URL is too long. Please use a shorter URL (max 512 chars).");
      return;
    }

    if (!normalizedImageUrl) {
      setError("Please upload a cover image or provide an image URL.");
      return;
    }

    startSubmit(async () => {
      try {
        await createHackathonAction(
          {
            title: form.title.trim(),
            slug: form.slug.trim() || slugify(form.title),
            summary: form.summary.trim(),
            description: form.description,
            theme: form.theme,
            tags: form.tags,
            startDate: form.startDate,
            endDate: form.endDate,
            applicationDeadline: form.applicationDeadline,
            locationType: form.locationType,
            location: form.location,
            externalRegUrl: form.externalRegUrl,
            imageUrl: normalizedImageUrl,
            applicationMode: form.applicationMode,
            minTeamSize: form.minTeamSize,
            maxTeamSize: form.maxTeamSize,
            sponsors: form.sponsors.filter((s) => s.name && s.name.trim() !== "New Sponsor"),
          },
          publish,
        );
        router.refresh();
      } catch (err: any) {
        setError(err?.message ?? "Something went wrong saving the hackathon.");
      }
    });
  }

  const currentYear = new Date().getFullYear();
  const yearSuffix = useMemo(() => String(currentYear).slice(-2), [currentYear]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Create Hackathon
        </h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => submit(false)}
            className="rounded-lg border border-edge px-5 py-2.5 text-sm font-medium text-mist transition-colors hover:border-fog hover:text-white disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => submit(true)}
            className="rounded-lg bg-sky px-5 py-2.5 text-sm font-semibold text-[#03171f] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Publish Event
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-[#c0392b]/50 bg-[#c0392b]/10 px-4 py-3 text-sm text-[#ff9b8b]">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Information */}
        <SectionCard icon={<InfoIcon className="h-5 w-5" />} title="Basic Information">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="title" required>
                Hackathon Title
              </FieldLabel>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. JHUB Winter Build 2024"
                className={inputCls}
              />
            </div>
            <div>
              <FieldLabel htmlFor="slug" required>
                URL Slug
              </FieldLabel>
              <div className="flex overflow-hidden rounded-lg border border-edge bg-panel">
                <span className="flex items-center border-r border-edge px-3 text-xs text-fog">
                  jhub.africa/
                </span>
                <input
                  id="slug"
                  type="text"
                  value={form.slug}
                  onChange={(e) => {
                    setForm((f) => ({
                      ...f,
                      slug: e.target.value,
                      slugTouched: true,
                    }));
                  }}
                  placeholder={`winter-build-${yearSuffix}`}
                  className="w-full bg-panel px-3 py-2.5 text-sm text-white placeholder:text-fog focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <FieldLabel htmlFor="summary" required>
              Short Summary
            </FieldLabel>
            <input
              id="summary"
              type="text"
              value={form.summary}
              onChange={(e) => update("summary", e.target.value)}
              placeholder="A one sentence overview of the event."
              className={inputCls}
            />
          </div>

          <div className="mt-4">
            <FieldLabel htmlFor="description">Detailed Description</FieldLabel>
            <div className="overflow-hidden rounded-lg border border-edge bg-panel focus-within:border-sky/60">
              <div className="flex items-center gap-1 border-b border-edge px-2 py-1.5">
                <ToolbarButton label="Bold">
                  <BoldIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton label="Italic">
                  <ItalicIcon className="h-4 w-4" />
                </ToolbarButton>
                <span className="mx-1 h-4 w-px bg-edge" />
                <ToolbarButton label="List">
                  <ListIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton label="Link">
                  <ChainIcon className="h-4 w-4" />
                </ToolbarButton>
              </div>
              <textarea
                id="description"
                rows={7}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe the challenges, rules, and expectations…"
                className="w-full resize-y bg-ink/40 px-4 py-3 text-sm text-white placeholder:text-fog focus:outline-none"
              />
            </div>
          </div>
        </SectionCard>

        {/* Timeline */}
        <SectionCard icon={<CalendarIcon className="h-5 w-5" />} title="Timeline">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <FieldLabel htmlFor="startDate" required>
                Start Date
              </FieldLabel>
              <input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <FieldLabel htmlFor="endDate" required>
                End Date
              </FieldLabel>
              <input
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={(e) => update("endDate", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <FieldLabel htmlFor="applicationDeadline" required>
                Application Deadline
              </FieldLabel>
              <input
                id="applicationDeadline"
                type="date"
                value={form.applicationDeadline}
                onChange={(e) => update("applicationDeadline", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </SectionCard>

        {/* Location details */}
        <SectionCard icon={<MapPin2Icon className="h-5 w-5" />} title="Location details">
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                { key: "physical", label: "Physical", Icon: BuildingIcon },
                { key: "virtual", label: "Virtual", Icon: LaptopIcon },
                { key: "hybrid", label: "Hybrid", Icon: UsersIcon },
              ] as const
            ).map(({ key, label, Icon }) => {
              const active = form.locationType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => update("locationType", key)}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border px-4 py-5 text-sm font-medium transition-colors ${
                    active
                      ? "border-sky/70 bg-sky/10 text-sky"
                      : "border-edge bg-panel text-mist hover:border-fog hover:text-white"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  {label}
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <FieldLabel htmlFor="location">Venue Address / Meeting Link</FieldLabel>
            <input
              id="location"
              type="text"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="e.g. JKUAT Main Campus, Assembly Hall or Zoom URL"
              className={inputCls}
            />
          </div>
        </SectionCard>

        {/* Media & Branding */}
        <SectionCard icon={<ImageIcon className="h-5 w-5" />} title="Media & Branding">
          <div className="flex items-end justify-between">
            <FieldLabel>Cover Image (16:9)</FieldLabel>
            <span className="text-xs text-fog">Recommended: 1920×1080px</span>
          </div>
          <label
            htmlFor="cover"
            className={`relative mt-3 flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-edge bg-panel ${
              isUploading ? "cursor-wait opacity-70" : "cursor-pointer"
            }`}
          >
            {coverPreviewUrl || form.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreviewUrl || form.imageUrl}
                alt="Cover preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="pointer-events-none flex flex-col items-center text-center">
                <UploadIcon className="mb-2 h-8 w-8 text-sky" />
                <p className="text-sm font-medium text-white">
                  {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
                </p>
                <p className="mt-0.5 text-xs text-fog">
                  {isUploading ? "Please wait" : "SVG, PNG, JPG or GIF (max 5MB)"}
                </p>
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="flex items-center gap-2 rounded-lg bg-panel px-4 py-2 text-sm text-white">
                  <svg className="h-4 w-4 animate-spin text-sky" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading...
                </div>
              </div>
            )}
            <input
              id="cover"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              className="hidden"
              disabled={isUploading}
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="mt-4">
            <FieldLabel htmlFor="imageUrl">Or paste Image URL</FieldLabel>
            <input
              id="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="https://example.com/cover-image.jpg"
              className={inputCls}
            />
            {form.imageUrl && (
              <p className="mt-1 text-xs text-mint">
                Image set: {form.imageUrl.length > 60 ? form.imageUrl.slice(0, 60) + "..." : form.imageUrl}
              </p>
            )}
          </div>
        </SectionCard>

        {/* How people apply */}
        <SectionCard icon={<UsersIcon className="h-5 w-5" />} title="Application Setup">
          <FieldLabel>How do people apply?</FieldLabel>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {(
              [
                {
                  key: "individual",
                  label: "Individually",
                  hint: "Each person applies for themselves.",
                },
                {
                  key: "team",
                  label: "As a team",
                  hint: "A team lead submits everyone's details.",
                },
              ] as const
            ).map(({ key, label, hint }) => {
              const active = form.applicationMode === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => update("applicationMode", key)}
                  className={`rounded-xl border px-4 py-4 text-left transition-colors ${
                    active
                      ? "border-sky/70 bg-sky/10"
                      : "border-edge bg-panel hover:border-fog"
                  }`}
                >
                  <p className={`text-sm font-semibold ${active ? "text-sky" : "text-white"}`}>
                    {label}
                  </p>
                  <p className="mt-0.5 text-xs text-fog">{hint}</p>
                </button>
              );
            })}
          </div>

          {form.applicationMode === "team" && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="minTeamSize" required>
                  Minimum team size
                </FieldLabel>
                <input
                  id="minTeamSize"
                  type="number"
                  min={1}
                  max={20}
                  value={form.minTeamSize}
                  onChange={(e) => update("minTeamSize", Number(e.target.value))}
                  className={inputCls}
                />
              </div>
              <div>
                <FieldLabel htmlFor="maxTeamSize" required>
                  Maximum team size
                </FieldLabel>
                <input
                  id="maxTeamSize"
                  type="number"
                  min={1}
                  max={20}
                  value={form.maxTeamSize}
                  onChange={(e) => update("maxTeamSize", Number(e.target.value))}
                  className={inputCls}
                />
              </div>
              <p className="text-xs text-fog sm:col-span-2">
                Team leads must submit between {form.minTeamSize} and {form.maxTeamSize} people
                (including themselves). A person can only join one team per hackathon.
              </p>
            </div>
          )}
        </SectionCard>

        {/* Registration + Themes */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard icon={<LinkIcon className="h-5 w-5" />} title="Registration">
            <FieldLabel htmlFor="extUrl">External Application URL</FieldLabel>
            <p className="-mt-1 mb-2 text-xs text-fog">
              If registrations are handled externally (e.g., Devpost).
            </p>
            <input
              id="extUrl"
              type="url"
              value={form.externalRegUrl}
              onChange={(e) => update("externalRegUrl", e.target.value)}
              placeholder="https://…"
              className={inputCls}
            />
          </SectionCard>

          <SectionCard icon={<TagIcon className="h-5 w-5" />} title="Themes / Tags">
            <FieldLabel>Select applicable themes</FieldLabel>
            <div className="mt-2 flex flex-wrap gap-2">
              {AVAILABLE_THEMES.map((t) => {
                const active = form.tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-sky/60 bg-sky/10 text-sky"
                        : "border-edge bg-panel text-mist hover:border-fog hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </SectionCard>
        </div>

        {/* Sponsors & Partners */}
        <SectionCard
          icon={<BuildingIcon className="h-5 w-5" />}
          title="Sponsors & Partners"
        >
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={addSponsor}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-sky hover:underline"
            >
              <PlusIcon className="h-4 w-4" /> Add Sponsor
            </button>
          </div>
          <div className="space-y-3">
            {form.sponsors.map((sponsor, i) => (
              <div
                key={i}
                className="rounded-xl border border-dashed border-edge bg-panel/40 px-4 py-4 sm:px-5"
              >
                <div className="flex items-start gap-3">
                  <GripIcon className="mt-3 h-4 w-4 shrink-0 text-fog" />
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <div>
                      <FieldLabel>Sponsor Name</FieldLabel>
                      <input
                        type="text"
                        value={sponsor.name}
                        onChange={(e) => updateSponsor(i, "name", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <FieldLabel>Logo URL</FieldLabel>
                      <input
                        type="url"
                        value={sponsor.logoUrl}
                        onChange={(e) => updateSponsor(i, "logoUrl", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove sponsor"
                    onClick={() => removeSponsor(i)}
                    className="mt-7 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-fog transition-colors hover:bg-[#c0392b]/20 hover:text-[#ff6b5b]"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/admin/hackathons"
            className="rounded-lg border border-edge px-5 py-2.5 text-sm font-medium text-mist transition-colors hover:border-fog hover:text-white"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded text-fog transition-colors hover:bg-ink/60 hover:text-white"
    >
      {children}
    </button>
  );
}
