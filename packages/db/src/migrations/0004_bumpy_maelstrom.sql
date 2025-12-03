ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "stacks" DROP CONSTRAINT "stacks_parent_id_stacks_id_fk";
--> statement-breakpoint
ALTER TABLE "tool_affiliate_links" DROP CONSTRAINT "tool_affiliate_links_tool_id_tools_id_fk";
--> statement-breakpoint
ALTER TABLE "tool_sponsorships" DROP CONSTRAINT "tool_sponsorships_tool_id_tools_id_fk";
--> statement-breakpoint
ALTER TABLE "tools_alternatives" DROP CONSTRAINT "tools_alternatives_tool_id_tools_id_fk";
--> statement-breakpoint
ALTER TABLE "tools_alternatives" DROP CONSTRAINT "tools_alternatives_alternative_tool_id_tools_id_fk";
--> statement-breakpoint
ALTER TABLE "tools_categories" DROP CONSTRAINT "tools_categories_tool_id_tools_id_fk";
--> statement-breakpoint
ALTER TABLE "tools_categories" DROP CONSTRAINT "tools_categories_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "tools_stacks" DROP CONSTRAINT "tools_stacks_tool_id_tools_id_fk";
--> statement-breakpoint
ALTER TABLE "tools_stacks" DROP CONSTRAINT "tools_stacks_stack_id_stacks_id_fk";
--> statement-breakpoint
ALTER TABLE "tools_tags" DROP CONSTRAINT "tools_tags_tool_id_tools_id_fk";
--> statement-breakpoint
ALTER TABLE "tools_tags" DROP CONSTRAINT "tools_tags_tag_id_tags_id_fk";
--> statement-breakpoint
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
ALTER TABLE "tools_tags" ADD CONSTRAINT "tools_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE cascade;