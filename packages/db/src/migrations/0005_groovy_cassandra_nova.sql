CREATE TABLE "categories_stacks" (
	"category_id" uuid NOT NULL,
	"stack_id" uuid NOT NULL,
	CONSTRAINT "categories_stacks_category_id_stack_id_pk" PRIMARY KEY("category_id","stack_id")
);
--> statement-breakpoint
ALTER TABLE "categories_stacks" ADD CONSTRAINT "categories_stacks_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "categories_stacks" ADD CONSTRAINT "categories_stacks_stack_id_stacks_id_fk" FOREIGN KEY ("stack_id") REFERENCES "public"."stacks"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "categories_stacks_category_idx" ON "categories_stacks" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "categories_stacks_stack_idx" ON "categories_stacks" USING btree ("stack_id");