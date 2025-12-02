CREATE TYPE "public"."license" AS ENUM('agpl-3', 'mit', 'apache-2', 'gpl-3', 'mpl-2', 'bsd-3-clause', 'gpl-2', 'lgpl-2-1', 'bsd-2-clause', 'epl-2', 'isc', 'lgpl-3');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TABLE "stacks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text,
	"icon" varchar(100),
	"parent_id" uuid,
	"weight" integer DEFAULT 0,
	"tool_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stacks_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tools_alternatives" (
	"tool_id" uuid NOT NULL,
	"alternative_tool_id" uuid NOT NULL,
	CONSTRAINT "tools_alternatives_tool_id_alternative_tool_id_pk" PRIMARY KEY("tool_id","alternative_tool_id")
);
--> statement-breakpoint
CREATE TABLE "tools_stacks" (
	"tool_id" uuid NOT NULL,
	"stack_id" uuid NOT NULL,
	CONSTRAINT "tools_stacks_tool_id_stack_id_pk" PRIMARY KEY("tool_id","stack_id")
);
--> statement-breakpoint
ALTER TABLE "tool_sponsorships" ALTER COLUMN "payment_status" SET DEFAULT 'pending'::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "tool_sponsorships" ALTER COLUMN "payment_status" SET DATA TYPE "public"."payment_status" USING "payment_status"::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "license" "license";--> statement-breakpoint
ALTER TABLE "stacks" ADD CONSTRAINT "stacks_parent_id_stacks_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."stacks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tools_alternatives" ADD CONSTRAINT "tools_alternatives_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tools_alternatives" ADD CONSTRAINT "tools_alternatives_alternative_tool_id_tools_id_fk" FOREIGN KEY ("alternative_tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tools_stacks" ADD CONSTRAINT "tools_stacks_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tools_stacks" ADD CONSTRAINT "tools_stacks_stack_id_stacks_id_fk" FOREIGN KEY ("stack_id") REFERENCES "public"."stacks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "stacks_slug_idx" ON "stacks" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "stacks_parent_idx" ON "stacks" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "stacks_weight_name_idx" ON "stacks" USING btree ("weight","name");--> statement-breakpoint
CREATE INDEX "stacks_tool_count_idx" ON "stacks" USING btree ("tool_count");--> statement-breakpoint
CREATE INDEX "tools_alternatives_tool_idx" ON "tools_alternatives" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "tools_alternatives_alternative_idx" ON "tools_alternatives" USING btree ("alternative_tool_id");--> statement-breakpoint
CREATE INDEX "tools_alternatives_bidirectional_idx" ON "tools_alternatives" USING btree ("tool_id","alternative_tool_id");--> statement-breakpoint
CREATE INDEX "tools_stacks_tool_idx" ON "tools_stacks" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "tools_stacks_stack_idx" ON "tools_stacks" USING btree ("stack_id");--> statement-breakpoint
CREATE INDEX "tags_type_slug_idx" ON "tags" USING btree ("type","slug");--> statement-breakpoint
CREATE INDEX "tool_affiliate_links_revenue_idx" ON "tool_affiliate_links" USING btree ("revenue_tracked");--> statement-breakpoint
CREATE INDEX "tool_affiliate_links_tool_revenue_idx" ON "tool_affiliate_links" USING btree ("tool_id","revenue_tracked");--> statement-breakpoint
CREATE INDEX "tool_sponsorships_active_priority_idx" ON "tool_sponsorships" USING btree ("is_active","priority_weight");--> statement-breakpoint
CREATE INDEX "tool_sponsorships_start_date_idx" ON "tool_sponsorships" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "tool_sponsorships_payment_status_idx" ON "tool_sponsorships" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "tools_license_idx" ON "tools" USING btree ("license");--> statement-breakpoint
CREATE INDEX "tools_pricing_license_idx" ON "tools" USING btree ("pricing","license");--> statement-breakpoint
CREATE INDEX "tools_featured_sponsored_idx" ON "tools" USING btree ("featured","is_sponsored");--> statement-breakpoint
CREATE INDEX "tools_monetization_enabled_idx" ON "tools" USING btree ("monetization_enabled");