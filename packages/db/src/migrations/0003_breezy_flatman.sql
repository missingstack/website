DROP INDEX "categories_tool_count_idx";--> statement-breakpoint
DROP INDEX "stacks_tool_count_idx";--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "tool_count";--> statement-breakpoint
ALTER TABLE "stacks" DROP COLUMN "tool_count";