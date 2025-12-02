/**
 * Stacks Schema
 *
 * Stacks are used for grouping tools together (e.g., "MERN Stack", "JAMstack").
 * Similar to categories but focused on technology stack groupings.
 *
 * Performance optimizations:
 * - Denormalized tool_count for O(1) count lookups
 * - Composite index for weight + name sorting
 */

import { relations } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
	index,
	integer,
	pgTable,
	text,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { timestampFields, uuidPrimaryKey } from "./base";
import { toolsStacks } from "./tools-stacks";

// Stacks table
export const stacks = pgTable(
	"stacks",
	{
		...uuidPrimaryKey,
		slug: varchar("slug", { length: 120 }).notNull().unique(),
		name: varchar("name", { length: 160 }).notNull(),
		description: text("description"),
		icon: varchar("icon", { length: 100 }),
		parentId: uuid("parent_id").references((): AnyPgColumn => stacks.id),
		weight: integer("weight").default(0),
		// Denormalized tool count - updated via trigger or application code
		// Eliminates expensive COUNT subqueries on reads
		toolCount: integer("tool_count").default(0).notNull(),
		...timestampFields,
	},
	(table) => [
		index("stacks_slug_idx").on(table.slug),
		index("stacks_parent_idx").on(table.parentId),
		index("stacks_weight_name_idx").on(table.weight, table.name),
		index("stacks_tool_count_idx").on(table.toolCount),
	],
);

// Stack relations
export const stacksRelations = relations(stacks, ({ one, many }) => ({
	parent: one(stacks, {
		fields: [stacks.parentId],
		references: [stacks.id],
		relationName: "parentStack",
	}),
	children: many(stacks, {
		relationName: "parentStack",
	}),
	tools: many(toolsStacks),
}));

export type Stack = typeof stacks.$inferSelect;
export type NewStack = typeof stacks.$inferInsert;
