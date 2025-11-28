CREATE TYPE "public"."badge_variant" AS ENUM('default', 'blue', 'green', 'purple', 'gold', 'secondary', 'outline');--> statement-breakpoint
CREATE TYPE "public"."icon_color" AS ENUM('emerald', 'orange', 'blue', 'purple', 'pink', 'green', 'cyan', 'amber', 'slate', 'red', 'yellow', 'indigo', 'teal');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('Web', 'Mac', 'Windows', 'Linux', 'iOS', 'Android', 'Extension', 'API');--> statement-breakpoint
CREATE TYPE "public"."pricing_model" AS ENUM('Free', 'Freemium', 'Paid', 'Open Source', 'Enterprise');--> statement-breakpoint
CREATE TYPE "public"."section_filter" AS ENUM('featured', 'popular', 'newest');--> statement-breakpoint
CREATE TYPE "public"."section_layout" AS ENUM('grid', 'large', 'carousel');--> statement-breakpoint
CREATE TYPE "public"."section_type" AS ENUM('filter', 'category');--> statement-breakpoint
CREATE TYPE "public"."tag_type" AS ENUM('pricing', 'platform', 'compliance', 'deployment', 'stage', 'feature');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text NOT NULL,
	"parent_id" text,
	"weight" integer DEFAULT 0,
	"tool_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"type" "tag_type" NOT NULL,
	"color" "badge_variant" DEFAULT 'default',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"tagline" text NOT NULL,
	"description" text NOT NULL,
	"logo" text NOT NULL,
	"website" text,
	"pricing" "pricing_model" NOT NULL,
	"featured" boolean DEFAULT false,
	"search_vector" "tsvector",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tools_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tools_categories" (
	"tool_id" text NOT NULL,
	"category_id" text NOT NULL,
	CONSTRAINT "tools_categories_tool_id_category_id_pk" PRIMARY KEY("tool_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "tools_platforms" (
	"tool_id" text NOT NULL,
	"platform" "platform" NOT NULL,
	CONSTRAINT "tools_platforms_tool_id_platform_pk" PRIMARY KEY("tool_id","platform")
);
--> statement-breakpoint
CREATE TABLE "tools_tags" (
	"tool_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "tools_tags_tool_id_tag_id_pk" PRIMARY KEY("tool_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tools_categories" ADD CONSTRAINT "tools_categories_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tools_categories" ADD CONSTRAINT "tools_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tools_platforms" ADD CONSTRAINT "tools_platforms_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tools_tags" ADD CONSTRAINT "tools_tags_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tools_tags" ADD CONSTRAINT "tools_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "categories_weight_name_idx" ON "categories" USING btree ("weight","name");--> statement-breakpoint
CREATE INDEX "categories_tool_count_idx" ON "categories" USING btree ("tool_count");--> statement-breakpoint
CREATE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tags_type_idx" ON "tags" USING btree ("type");--> statement-breakpoint
CREATE INDEX "tools_slug_idx" ON "tools" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tools_name_idx" ON "tools" USING btree ("name");--> statement-breakpoint
CREATE INDEX "tools_featured_created_idx" ON "tools" USING btree ("featured","created_at");--> statement-breakpoint
CREATE INDEX "tools_pricing_created_idx" ON "tools" USING btree ("pricing","created_at");--> statement-breakpoint
CREATE INDEX "tools_featured_pricing_idx" ON "tools" USING btree ("featured","pricing");--> statement-breakpoint
CREATE INDEX "tools_search_idx" ON "tools" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "tools_categories_tool_idx" ON "tools_categories" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "tools_categories_category_idx" ON "tools_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "tools_platforms_tool_idx" ON "tools_platforms" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "tools_platforms_platform_idx" ON "tools_platforms" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "tools_tags_tool_idx" ON "tools_tags" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "tools_tags_tag_idx" ON "tools_tags" USING btree ("tag_id");