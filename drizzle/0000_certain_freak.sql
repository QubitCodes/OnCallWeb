CREATE TABLE "admins" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"full_name" varchar(255),
	"role" varchar(100) DEFAULT 'admin' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"delete_reason" varchar(255),
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"service_type" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"status" varchar(50) DEFAULT 'view' NOT NULL,
	"comment" text,
	"follow_up_date" timestamp,
	"follow_up_time" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"delete_reason" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"region" varchar(100) NOT NULL,
	"county" varchar(255) NOT NULL,
	"postcode" varchar(50) NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"delete_reason" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "service_availabilities" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" varchar(36) NOT NULL,
	"location_id" varchar(36) NOT NULL,
	"postcode" varchar(50) NOT NULL,
	"postcode_search" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"delete_reason" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255),
	"category" varchar(100) NOT NULL,
	"price" double precision,
	"duration" integer,
	"description" text,
	"full_description" text,
	"detailed_description" text,
	"what_is" text,
	"typical_visit" text,
	"services" json,
	"getting_started_points" json,
	"stats" json,
	"benefits" text,
	"benefits_extended" text,
	"getting_started" text,
	"image" varchar(255),
	"icon" varchar(255),
	"zipcodes" json,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"delete_reason" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" json,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"delete_reason" varchar(255),
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
