CREATE TABLE "proposals" (
	"id" serial PRIMARY KEY NOT NULL,
	"rfp_id" integer NOT NULL,
	"vendor_id" integer NOT NULL,
	"raw_content" text,
	"extracted_data" jsonb,
	"ai_score" integer,
	"ai_summary" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rfps" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"original_request" text NOT NULL,
	"structured_requirements" jsonb,
	"status" text DEFAULT 'draft',
	"budget" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"contact_person" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "vendors_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_rfp_id_rfps_id_fk" FOREIGN KEY ("rfp_id") REFERENCES "public"."rfps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;