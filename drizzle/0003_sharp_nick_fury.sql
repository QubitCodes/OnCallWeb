DELETE FROM "services" WHERE "category" IS NOT NULL;--> statement-breakpoint
UPDATE "services" SET "category" = NULL;--> statement-breakpoint
DELETE FROM "service_categories";--> statement-breakpoint
ALTER TABLE "service_categories" DROP COLUMN "id" CASCADE;--> statement-breakpoint
ALTER TABLE "service_categories" ADD COLUMN "id" SERIAL PRIMARY KEY;--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "category" SET DATA TYPE integer USING "category"::integer;