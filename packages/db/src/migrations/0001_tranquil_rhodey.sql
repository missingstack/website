CREATE TYPE "public"."sponsorship_tier" AS ENUM('basic', 'premium', 'enterprise');--> statement-breakpoint
CREATE TABLE "tool_affiliate_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tool_id" uuid NOT NULL,
	"affiliate_url" varchar(512) NOT NULL,
	"commission_rate" numeric(5, 4) DEFAULT '0',
	"tracking_code" varchar(100),
	"is_primary" boolean DEFAULT false NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"revenue_tracked" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tool_sponsorships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tool_id" uuid NOT NULL,
	"tier" "sponsorship_tier" NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority_weight" integer DEFAULT 0 NOT NULL,
	"payment_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "affiliate_url" varchar(512);--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "sponsorship_priority" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "is_sponsored" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "monetization_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tool_affiliate_links" ADD CONSTRAINT "tool_affiliate_links_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_sponsorships" ADD CONSTRAINT "tool_sponsorships_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tool_affiliate_links_tool_idx" ON "tool_affiliate_links" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "tool_affiliate_links_primary_idx" ON "tool_affiliate_links" USING btree ("is_primary");--> statement-breakpoint
CREATE INDEX "tool_affiliate_links_tool_primary_idx" ON "tool_affiliate_links" USING btree ("tool_id","is_primary");--> statement-breakpoint
CREATE INDEX "tool_sponsorships_tool_idx" ON "tool_sponsorships" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "tool_sponsorships_active_idx" ON "tool_sponsorships" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "tool_sponsorships_end_date_idx" ON "tool_sponsorships" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "tool_sponsorships_active_end_date_idx" ON "tool_sponsorships" USING btree ("is_active","end_date");--> statement-breakpoint
CREATE INDEX "tool_sponsorships_priority_weight_idx" ON "tool_sponsorships" USING btree ("priority_weight");--> statement-breakpoint
CREATE INDEX "tools_sponsorship_priority_idx" ON "tools" USING btree ("sponsorship_priority");--> statement-breakpoint
CREATE INDEX "tools_is_sponsored_idx" ON "tools" USING btree ("is_sponsored");