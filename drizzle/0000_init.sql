CREATE TABLE "application_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"hackathon_id" integer NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(320) NOT NULL,
	"role" varchar(16) DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"hackathon_id" integer NOT NULL,
	"mode" varchar(16) NOT NULL,
	"team_name" varchar(200) DEFAULT '' NOT NULL,
	"lead_name" varchar(200) NOT NULL,
	"lead_email" varchar(320) NOT NULL,
	"institution" varchar(200) DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"status" varchar(24) DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hackathons" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(128) NOT NULL,
	"title" varchar(256) NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"theme" varchar(64) DEFAULT '' NOT NULL,
	"tags" text DEFAULT '' NOT NULL,
	"status" varchar(32) DEFAULT 'applications_open' NOT NULL,
	"admin_status" varchar(24) DEFAULT 'draft' NOT NULL,
	"track" varchar(128) DEFAULT '' NOT NULL,
	"participant_count" integer DEFAULT 0 NOT NULL,
	"start_date" date,
	"end_date" date,
	"application_deadline" date,
	"location" varchar(256) DEFAULT '' NOT NULL,
	"location_type" varchar(32) DEFAULT 'physical' NOT NULL,
	"external_reg_url" varchar(512) DEFAULT '' NOT NULL,
	"image_url" varchar(512) DEFAULT '' NOT NULL,
	"application_mode" varchar(16) DEFAULT 'individual' NOT NULL,
	"min_team_size" integer DEFAULT 2 NOT NULL,
	"max_team_size" integer DEFAULT 5 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hackathons_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"category" varchar(64) NOT NULL,
	"type" varchar(24) NOT NULL,
	"image" varchar(512) DEFAULT '' NOT NULL,
	"href" varchar(512) DEFAULT '' NOT NULL,
	"read_time" varchar(64) DEFAULT '' NOT NULL,
	"duration" varchar(64) DEFAULT '' NOT NULL,
	"file_info" varchar(128) DEFAULT '' NOT NULL,
	"tags" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "resources_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sponsors" (
	"id" serial PRIMARY KEY NOT NULL,
	"hackathon_id" integer NOT NULL,
	"name" varchar(256) NOT NULL,
	"logo_url" varchar(512) DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application_members" ADD CONSTRAINT "application_members_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_members" ADD CONSTRAINT "application_members_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "application_members_hackathon_email_unique" ON "application_members" USING btree ("hackathon_id","email");--> statement-breakpoint
CREATE INDEX "applications_hackathon_idx" ON "applications" USING btree ("hackathon_id");--> statement-breakpoint
CREATE INDEX "hackathons_admin_status_idx" ON "hackathons" USING btree ("admin_status");