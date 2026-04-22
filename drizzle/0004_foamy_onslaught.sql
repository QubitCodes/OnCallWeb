CREATE TABLE "location_template_areas" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" varchar(36) NOT NULL,
	"location_id" varchar(36),
	"boundary" json,
	"type" varchar(50) DEFAULT 'include' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"delete_reason" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "location_templates" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"delete_reason" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "locations" ALTER COLUMN "region" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "locations" ALTER COLUMN "county" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "locations" ALTER COLUMN "postcode" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "service_availabilities" ALTER COLUMN "location_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "service_availabilities" ALTER COLUMN "postcode" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "boundary" json;--> statement-breakpoint
ALTER TABLE "service_availabilities" ADD COLUMN "template_id" varchar(36);--> statement-breakpoint
ALTER TABLE "service_availabilities" ADD COLUMN "boundary" json;--> statement-breakpoint
ALTER TABLE "service_availabilities" ADD COLUMN "type" varchar(50) DEFAULT 'include' NOT NULL;--> statement-breakpoint
ALTER TABLE "location_template_areas" ADD CONSTRAINT "location_template_areas_template_id_location_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."location_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_availabilities" ADD CONSTRAINT "service_availabilities_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_availabilities" ADD CONSTRAINT "service_availabilities_template_id_location_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."location_templates"("id") ON DELETE no action ON UPDATE no action;