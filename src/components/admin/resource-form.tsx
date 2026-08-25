"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RESOURCE_CATEGORIES, type Resource, type ResourceType } from "@/data/resources";
import { slugify } from "@/lib/slugify";
import {
  createResourceAction,
  updateResourceAction,
} from "@/app/admin/resources/actions";
import { ImageIcon, InfoIcon, LinkIcon, TagIcon } from "../icons";

interface FormState {
  title: string;
  slug: string;
  slugTouched: boolean;
  description: string;
  category: string;
  type: ResourceType;
  image: string;
  href: string;
  readTime: string;
  duration: string;
  fileInfo: string;
  tags: string[];
}

function getInitialState(existing?: Resource): FormState {
  if (!existing) {
    return {
      title: "",
      slug: "",
      slugTouched: false,
      description: "",
      category: RESOURCE_CATEGORIES[0],
      type: "article",
      image: "",
      href: "",
      readTime: "",
      duration: "",
      fileInfo: "",
      tags: [],
    };
  }

  return {
    title: existing.title,
    slug: existing.slug,
    slugTouched: true,
    description: existing.description,
    category: existing.category,
    type: existing.type,
    image: existing.image,
    href: existing.href,
    readTime: existing.type === "article" ? existing.readTime : "",
    duration: existing.type === "video" ? existing.duration : "",
    fileInfo: existing.type === "download" ? existing.fileInfo : "",
    tags: existing.type === "showcase" ? existing.tags : [],
  };
}

const inputCls =
  "w-full rounded-lg border border-edge bg-panel px-3.5 py-2.5 text-sm text-white placeholder:text-fog focus:border-sky/60 focus:outline-none";

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-edge-soft bg-card p-5 sm:p-7">
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

export function ResourceForm({ existing }: { existing?: Resource }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => getInitialState(existing));
  const [isPending, startSubmit] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!existing;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value } as FormState;
      if (key === "title" && !f.slugTouched) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  async function handleFileUpload(file: File | null) {
    if (!file) return;

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
      update("image", data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      update("tags", [...form.tags, tag]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    update("tags", form.tags.filter((t) => t !== tag));
  }

  async function submit() {
    setError(null);

    if (!form.title.trim()) {
      setError("Resource title is required.");
      return;
    }
    if (!form.category) {
      setError("Category is required.");
      return;
    }

    startSubmit(async () => {
      try {
        if (isEditing) {
          await updateResourceAction(existing!.slug, {
            title: form.title.trim(),
            slug: form.slug.trim() || slugify(form.title),
            description: form.description.trim(),
            category: form.category,
            type: form.type,
            image: form.image.trim(),
            href: form.href.trim(),
            readTime: form.readTime,
            duration: form.duration,
            fileInfo: form.fileInfo,
            tags: form.tags,
          });
        } else {
          await createResourceAction({
            title: form.title.trim(),
            slug: form.slug.trim() || slugify(form.title),
            description: form.description.trim(),
            category: form.category,
            type: form.type,
            image: form.image.trim(),
            href: form.href.trim(),
            readTime: form.readTime,
            duration: form.duration,
            fileInfo: form.fileInfo,
            tags: form.tags,
          });
        }
        router.push("/admin/resources");
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {isEditing ? "Edit Resource" : "Add New Resource"}
        </h1>
        <button
          type="button"
          disabled={isPending}
          onClick={submit}
          className="rounded-lg bg-sky px-5 py-2.5 text-sm font-semibold text-[#03171f] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Resource"}
        </button>
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
                Resource Title
              </FieldLabel>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Figma UI Starter Kit"
                className={inputCls}
              />
            </div>
            <div>
              <FieldLabel htmlFor="slug" required>
                URL Slug
              </FieldLabel>
              <div className="flex overflow-hidden rounded-lg border border-edge bg-panel">
                <span className="flex items-center border-r border-edge px-3 text-xs text-fog">
                  /resources/
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
                  placeholder="figma-ui-starter-kit"
                  className="w-full bg-panel px-3 py-2.5 text-sm text-white placeholder:text-fog focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe this resource..."
              className={`${inputCls} resize-y`}
            />
          </div>
        </SectionCard>

        {/* Type & Category */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard icon={<TagIcon className="h-5 w-5" />} title="Type">
            <FieldLabel required>Resource Type</FieldLabel>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {(
                [
                  { key: "article", label: "Article", hint: "Written content with read time" },
                  { key: "video", label: "Video", hint: "Video content with duration" },
                  { key: "download", label: "Download", hint: "File download with size info" },
                  { key: "showcase", label: "Showcase", hint: "Past project showcase with tags" },
                ] as const
              ).map(({ key, label, hint }) => {
                const active = form.type === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => update("type", key)}
                    className={`rounded-xl border px-4 py-3 text-left transition-colors ${
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
          </SectionCard>

          <SectionCard icon={<InfoIcon className="h-5 w-5" />} title="Category">
            <FieldLabel required>Category</FieldLabel>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className={`${inputCls} mt-2`}
            >
              {RESOURCE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </SectionCard>
        </div>

        {/* Type-specific fields */}
        {form.type === "article" && (
          <SectionCard icon={<InfoIcon className="h-5 w-5" />} title="Article Details">
            <FieldLabel htmlFor="readTime">Read Time</FieldLabel>
            <input
              id="readTime"
              type="text"
              value={form.readTime}
              onChange={(e) => update("readTime", e.target.value)}
              placeholder="e.g. 5 min read"
              className={inputCls}
            />
          </SectionCard>
        )}

        {form.type === "video" && (
          <SectionCard icon={<InfoIcon className="h-5 w-5" />} title="Video Details">
            <FieldLabel htmlFor="duration">Duration</FieldLabel>
            <input
              id="duration"
              type="text"
              value={form.duration}
              onChange={(e) => update("duration", e.target.value)}
              placeholder="e.g. 45 mins"
              className={inputCls}
            />
          </SectionCard>
        )}

        {form.type === "download" && (
          <SectionCard icon={<InfoIcon className="h-5 w-5" />} title="Download Details">
            <FieldLabel htmlFor="fileInfo">File Info</FieldLabel>
            <input
              id="fileInfo"
              type="text"
              value={form.fileInfo}
              onChange={(e) => update("fileInfo", e.target.value)}
              placeholder="e.g. ZIP File (12MB)"
              className={inputCls}
            />
          </SectionCard>
        )}

        {form.type === "showcase" && (
          <SectionCard icon={<TagIcon className="h-5 w-5" />} title="Showcase Tags">
            <FieldLabel>Tags</FieldLabel>
            <div className="mt-2 flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-sky/10 px-3 py-1 text-xs font-medium text-sky"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-0.5 hover:text-white"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag..."
                className={inputCls}
              />
              <button
                type="button"
                onClick={addTag}
                className="shrink-0 rounded-lg bg-panel px-4 py-2.5 text-sm font-medium text-mist transition-colors hover:text-white"
              >
                Add
              </button>
            </div>
          </SectionCard>
        )}

        {/* Media & Links */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard icon={<ImageIcon className="h-5 w-5" />} title="Image">
            <label
              className={`flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-edge bg-panel ${
                isUploading ? "cursor-wait opacity-70" : "cursor-pointer"
              }`}
            >
              {form.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.image}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="pointer-events-none flex flex-col items-center text-center">
                  <ImageIcon className="mb-2 h-8 w-8 text-sky" />
                  <p className="text-sm font-medium text-white">
                    {isUploading ? "Uploading..." : "Click to upload an image"}
                  </p>
                  <p className="mt-0.5 text-xs text-fog">
                    {isUploading ? "Please wait" : "PNG, JPG or GIF (max 5MB)"}
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
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  handleFileUpload(file);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              />
            </label>

            <div className="mt-3">
              <FieldLabel htmlFor="image">Or paste Image URL</FieldLabel>
              <input
                id="image"
                type="url"
                value={form.image}
                onChange={(e) => update("image", e.target.value)}
                placeholder="https://example.com/image.jpg"
                className={inputCls}
              />
              {form.image && (
                <p className="mt-1 text-xs text-mint">
                  Image set: {form.image.length > 50 ? form.image.slice(0, 50) + "..." : form.image}
                </p>
              )}
            </div>
          </SectionCard>

          <SectionCard icon={<LinkIcon className="h-5 w-5" />} title="Links">
            <FieldLabel htmlFor="href">External Link</FieldLabel>
            <p className="-mt-1 mb-2 text-xs text-fog">
              Where this resource links to. Leave empty to use the default resource page.
            </p>
            <input
              id="href"
              type="url"
              value={form.href}
              onChange={(e) => update("href", e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
          </SectionCard>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/admin/resources"
            className="rounded-lg border border-edge px-5 py-2.5 text-sm font-medium text-mist transition-colors hover:border-fog hover:text-white"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
