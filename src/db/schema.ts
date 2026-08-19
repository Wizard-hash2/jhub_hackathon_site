import {
  date,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const hackathons = pgTable(
  "hackathons",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 128 }).notNull().unique(),
    title: varchar("title", { length: 256 }).notNull(),
    summary: text("summary").notNull().default(""),
    description: text("description").notNull().default(""),
    theme: varchar("theme", { length: 64 }).notNull().default(""),
    tags: text("tags").notNull().default(""),
    status: varchar("status", { length: 32 }).notNull().default("applications_open"),
    adminStatus: varchar("admin_status", { length: 24 }).notNull().default("draft"),
    track: varchar("track", { length: 128 }).notNull().default(""),
    participantCount: integer("participant_count").notNull().default(0),
    startDate: date("start_date"),
    endDate: date("end_date"),
    applicationDeadline: date("application_deadline"),
    location: varchar("location", { length: 256 }).notNull().default(""),
    locationType: varchar("location_type", { length: 32 }).notNull().default("physical"),
    externalRegUrl: varchar("external_reg_url", { length: 512 }).notNull().default(""),
    imageUrl: varchar("image_url", { length: 512 }).notNull().default(""),

    /** How people apply: "individual" or "team". Configured by the admin. */
    applicationMode: varchar("application_mode", { length: 16 }).notNull().default("individual"),
    /** Inclusive team-size range, only meaningful when applicationMode = "team". */
    minTeamSize: integer("min_team_size").notNull().default(2),
    maxTeamSize: integer("max_team_size").notNull().default(5),

    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    adminStatusIdx: index("hackathons_admin_status_idx").on(table.adminStatus),
  }),
);

export const sponsors = pgTable("sponsors", {
  id: serial("id").primaryKey(),
  hackathonId: integer("hackathon_id")
    .notNull()
    .references(() => hackathons.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 256 }).notNull(),
  logoUrl: varchar("logo_url", { length: 512 }).notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

/** One row per submitted application (a solo entry OR a whole team). */
export const applications = pgTable(
  "applications",
  {
    id: serial("id").primaryKey(),
    hackathonId: integer("hackathon_id")
      .notNull()
      .references(() => hackathons.id, { onDelete: "cascade" }),
    /** "individual" | "team" — snapshot of the hackathon's mode at apply time. */
    mode: varchar("mode", { length: 16 }).notNull(),
    /** Only used for team applications. */
    teamName: varchar("team_name", { length: 200 }).notNull().default(""),
    leadName: varchar("lead_name", { length: 200 }).notNull(),
    leadEmail: varchar("lead_email", { length: 320 }).notNull(),
    institution: varchar("institution", { length: 200 }).notNull().default(""),
    notes: text("notes").notNull().default(""),
    status: varchar("status", { length: 24 }).notNull().default("submitted"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    byHackathon: index("applications_hackathon_idx").on(table.hackathonId),
  }),
);

/**
 * Every person attached to an application, including the team lead.
 * The unique index on (hackathon_id, email) is what stops one person
 * from being registered in two different teams for the same hackathon.
 */
export const applicationMembers = pgTable(
  "application_members",
  {
    id: serial("id").primaryKey(),
    applicationId: integer("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    hackathonId: integer("hackathon_id")
      .notNull()
      .references(() => hackathons.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    /** "lead" | "member" */
    role: varchar("role", { length: 16 }).notNull().default("member"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    uniquePerHackathon: uniqueIndex("application_members_hackathon_email_unique").on(
      table.hackathonId,
      table.email,
    ),
  }),
);

/** Resources are now database-backed so they can be created/edited via the API. */
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").notNull().default(""),
  category: varchar("category", { length: 64 }).notNull(),
  /** "article" | "video" | "download" | "showcase" */
  type: varchar("type", { length: 24 }).notNull(),
  image: varchar("image", { length: 512 }).notNull().default(""),
  href: varchar("href", { length: 512 }).notNull().default(""),
  readTime: varchar("read_time", { length: 64 }).notNull().default(""),
  duration: varchar("duration", { length: 64 }).notNull().default(""),
  fileInfo: varchar("file_info", { length: 128 }).notNull().default(""),
  tags: text("tags").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Hackathon = typeof hackathons.$inferSelect;
export type NewHackathon = typeof hackathons.$inferInsert;
export type Sponsor = typeof sponsors.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type ApplicationMember = typeof applicationMembers.$inferSelect;
export type ResourceRow = typeof resources.$inferSelect;
