CREATE TABLE "service_categories" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255),
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"delete_reason" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "category" DROP NOT NULL;--> statement-breakpoint
UPDATE "services" SET "category" = NULL;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_category_service_categories_id_fk" FOREIGN KEY ("category") REFERENCES "public"."service_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "price";--> statement-breakpoint
ALTER TABLE "services" DROP COLUMN "duration";