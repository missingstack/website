/**
 * Tools Stacks Junction Table
 *
 * Many-to-many relationship between tools and stacks.
 * Allows tools to belong to multiple technology stacks (e.g., "MERN Stack", "JAMstack").
 *
 * Performance optimizations:
 * - Composite primary key on (tool_id, stack_id)
 * - Indexes on both foreign keys for efficient joins
 */

import { relations } from "drizzle-orm";
import { index, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { stacks } from "./stacks";
import { tools } from "./tools";

// Junction table: tools <-> stacks (many-to-many)
export const toolsStacks = pgTable(
	"tools_stacks",
	{
		toolId: uuid("tool_id")
			.notNull()
			.references(() => tools.id, { onDelete: "cascade" }),
		stackId: uuid("stack_id")
			.notNull()
			.references(() => stacks.id, { onDelete: "cascade" }),
	},
	(table) => [
		primaryKey({ columns: [table.toolId, table.stackId] }),
		index("tools_stacks_tool_idx").on(table.toolId),
		index("tools_stacks_stack_idx").on(table.stackId),
	],
);

// Junction table relations
export const toolsStacksRelations = relations(toolsStacks, ({ one }) => ({
	tool: one(tools, {
		fields: [toolsStacks.toolId],
		references: [tools.id],
	}),
	stack: one(stacks, {
		fields: [toolsStacks.stackId],
		references: [stacks.id],
	}),
}));

export type ToolStack = typeof toolsStacks.$inferSelect;
export type NewToolStack = typeof toolsStacks.$inferInsert;
