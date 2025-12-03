CREATE TYPE "public"."badge_variant" AS ENUM('default', 'blue', 'green', 'purple', 'gold', 'secondary', 'outline');--> statement-breakpoint
CREATE TYPE "public"."icon_color" AS ENUM('emerald', 'orange', 'blue', 'purple', 'pink', 'green', 'cyan', 'amber', 'slate', 'red', 'yellow', 'indigo', 'teal');--> statement-breakpoint
CREATE TYPE "public"."license" AS ENUM('agpl-3', 'mit', 'apache-2', 'gpl-3', 'mpl-2', 'bsd-3-clause', 'gpl-2', 'lgpl-2-1', 'bsd-2-clause', 'epl-2', 'isc', 'lgpl-3');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('web', 'mac', 'windows', 'linux', 'ios', 'android', 'extension', 'api');--> statement-breakpoint
CREATE TYPE "public"."pricing_model" AS ENUM('free', 'freemium', 'paid', 'open-source', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."section_filter" AS ENUM('featured', 'popular', 'newest');--> statement-breakpoint
CREATE TYPE "public"."section_layout" AS ENUM('grid', 'large', 'carousel');--> statement-breakpoint
CREATE TYPE "public"."section_type" AS ENUM('filter', 'category');--> statement-breakpoint
CREATE TYPE "public"."sponsorship_tier" AS ENUM('basic', 'premium', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."tag_type" AS ENUM('pricing', 'platform', 'compliance', 'deployment', 'stage', 'feature');--> statement-breakpoint
CREATE TABLE "categories_stacks" (
	"category_id" uuid NOT NULL,
	"stack_id" uuid NOT NULL,
	CONSTRAINT "categories_stacks_category_id_stack_id_pk" PRIMARY KEY("category_id","stack_id")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text,
	"icon" varchar(100) NOT NULL,
	"parent_id" uuid,
	"weight" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "stacks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text,
	"icon" varchar(100),
	"parent_id" uuid,
	"weight" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stacks_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"type" "tag_type" NOT NULL,
	"color" "badge_variant" DEFAULT 'default',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
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
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(120) NOT NULL,
	"name" varchar(160) NOT NULL,
	"tagline" varchar(256),
	"description" text NOT NULL,
	"logo" varchar(256) NOT NULL,
	"website" varchar(256),
	"pricing" "pricing_model" NOT NULL,
	"license" "license",
	"featured" boolean DEFAULT false,
	"affiliate_url" varchar(512),
	"sponsorship_priority" integer DEFAULT 0 NOT NULL,
	"is_sponsored" boolean DEFAULT false NOT NULL,
	"monetization_enabled" boolean DEFAULT false NOT NULL,
	"search_vector" "tsvector",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tools_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tools_alternatives" (
	"tool_id" uuid NOT NULL,
	"alternative_tool_id" uuid NOT NULL,
	CONSTRAINT "tools_alternatives_tool_id_alternative_tool_id_pk" PRIMARY KEY("tool_id","alternative_tool_id")
);
--> statement-breakpoint
CREATE TABLE "tools_categories" (
	"tool_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "tools_categories_tool_id_category_id_pk" PRIMARY KEY("tool_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "tools_stacks" (
	"tool_id" uuid NOT NULL,
	"stack_id" uuid NOT NULL,
	CONSTRAINT "tools_stacks_tool_id_stack_id_pk" PRIMARY KEY("tool_id","stack_id")
);
--> statement-breakpoint
CREATE TABLE "tools_tags" (
	"tool_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "tools_tags_tool_id_tag_id_pk" PRIMARY KEY("tool_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "categories_stacks" ADD CONSTRAINT "categories_stacks_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "categories_stacks" ADD CONSTRAINT "categories_stacks_stack_id_stacks_id_fk" FOREIGN KEY ("stack_id") REFERENCES "public"."stacks"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "stacks" ADD CONSTRAINT "stacks_parent_id_stacks_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."stacks"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tool_affiliate_links" ADD CONSTRAINT "tool_affiliate_links_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tool_sponsorships" ADD CONSTRAINT "tool_sponsorships_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tools_alternatives" ADD CONSTRAINT "tools_alternatives_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tools_alternatives" ADD CONSTRAINT "tools_alternatives_alternative_tool_id_tools_id_fk" FOREIGN KEY ("alternative_tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tools_categories" ADD CONSTRAINT "tools_categories_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tools_categories" ADD CONSTRAINT "tools_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tools_stacks" ADD CONSTRAINT "tools_stacks_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tools_stacks" ADD CONSTRAINT "tools_stacks_stack_id_stacks_id_fk" FOREIGN KEY ("stack_id") REFERENCES "public"."stacks"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tools_tags" ADD CONSTRAINT "tools_tags_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tools_tags" ADD CONSTRAINT "tools_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "categories_stacks_category_idx" ON "categories_stacks" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "categories_stacks_stack_idx" ON "categories_stacks" USING btree ("stack_id");--> statement-breakpoint
CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "categories_weight_name_idx" ON "categories" USING btree ("weight","name");--> statement-breakpoint
CREATE INDEX "stacks_slug_idx" ON "stacks" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "stacks_parent_idx" ON "stacks" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "stacks_weight_name_idx" ON "stacks" USING btree ("weight","name");--> statement-breakpoint
CREATE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tags_type_idx" ON "tags" USING btree ("type");--> statement-breakpoint
CREATE INDEX "tags_type_slug_idx" ON "tags" USING btree ("type","slug");--> statement-breakpoint
CREATE INDEX "tool_affiliate_links_tool_idx" ON "tool_affiliate_links" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "tool_affiliate_links_primary_idx" ON "tool_affiliate_links" USING btree ("is_primary");--> statement-breakpoint
CREATE INDEX "tool_affiliate_links_tool_primary_idx" ON "tool_affiliate_links" USING btree ("tool_id","is_primary");--> statement-breakpoint
CREATE INDEX "tool_affiliate_links_revenue_idx" ON "tool_affiliate_links" USING btree ("revenue_tracked");--> statement-breakpoint
CREATE INDEX "tool_affiliate_links_tool_revenue_idx" ON "tool_affiliate_links" USING btree ("tool_id","revenue_tracked");--> statement-breakpoint
CREATE INDEX "tool_sponsorships_tool_idx" ON "tool_sponsorships" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "tool_sponsorships_active_idx" ON "tool_sponsorships" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "tool_sponsorships_end_date_idx" ON "tool_sponsorships" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "tool_sponsorships_active_end_date_idx" ON "tool_sponsorships" USING btree ("is_active","end_date");--> statement-breakpoint
CREATE INDEX "tool_sponsorships_priority_weight_idx" ON "tool_sponsorships" USING btree ("priority_weight");--> statement-breakpoint
CREATE INDEX "tool_sponsorships_active_priority_idx" ON "tool_sponsorships" USING btree ("is_active","priority_weight");--> statement-breakpoint
CREATE INDEX "tool_sponsorships_start_date_idx" ON "tool_sponsorships" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "tool_sponsorships_payment_status_idx" ON "tool_sponsorships" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "tools_slug_idx" ON "tools" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tools_name_idx" ON "tools" USING btree ("name");--> statement-breakpoint
CREATE INDEX "tools_featured_created_idx" ON "tools" USING btree ("featured","created_at");--> statement-breakpoint
CREATE INDEX "tools_pricing_created_idx" ON "tools" USING btree ("pricing","created_at");--> statement-breakpoint
CREATE INDEX "tools_featured_pricing_idx" ON "tools" USING btree ("featured","pricing");--> statement-breakpoint
CREATE INDEX "tools_license_idx" ON "tools" USING btree ("license");--> statement-breakpoint
CREATE INDEX "tools_pricing_license_idx" ON "tools" USING btree ("pricing","license");--> statement-breakpoint
CREATE INDEX "tools_sponsorship_priority_idx" ON "tools" USING btree ("sponsorship_priority");--> statement-breakpoint
CREATE INDEX "tools_is_sponsored_idx" ON "tools" USING btree ("is_sponsored");--> statement-breakpoint
CREATE INDEX "tools_featured_sponsored_idx" ON "tools" USING btree ("featured","is_sponsored");--> statement-breakpoint
CREATE INDEX "tools_monetization_enabled_idx" ON "tools" USING btree ("monetization_enabled");--> statement-breakpoint
CREATE INDEX "tools_search_idx" ON "tools" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "tools_alternatives_tool_idx" ON "tools_alternatives" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "tools_alternatives_alternative_idx" ON "tools_alternatives" USING btree ("alternative_tool_id");--> statement-breakpoint
CREATE INDEX "tools_alternatives_bidirectional_idx" ON "tools_alternatives" USING btree ("tool_id","alternative_tool_id");--> statement-breakpoint
CREATE INDEX "tools_categories_tool_idx" ON "tools_categories" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "tools_categories_category_idx" ON "tools_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "tools_stacks_tool_idx" ON "tools_stacks" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "tools_stacks_stack_idx" ON "tools_stacks" USING btree ("stack_id");--> statement-breakpoint
CREATE INDEX "tools_tags_tool_idx" ON "tools_tags" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "tools_tags_tag_idx" ON "tools_tags" USING btree ("tag_id");