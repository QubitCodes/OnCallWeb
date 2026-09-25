ALTER TABLE "locations" RENAME TO "x_locations";--> statement-breakpoint
CREATE INDEX "lta_template_id_idx" ON "location_template_areas" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "loc_postcode_idx" ON "x_locations" USING btree ("postcode");--> statement-breakpoint
CREATE INDEX "sa_service_id_idx" ON "service_availabilities" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "sa_postcode_idx" ON "service_availabilities" USING btree ("postcode");--> statement-breakpoint
CREATE INDEX "sa_template_id_idx" ON "service_availabilities" USING btree ("template_id");