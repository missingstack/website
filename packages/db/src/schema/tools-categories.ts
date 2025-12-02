/**
 * Tools Categories Junction Table
 *
 * Many-to-many relationship between tools and categories.
 * Allows tools to belong to multiple categories.
 *
 * Performance optimizations:
 * - Composite primary key on (tool_id, category_id)
 * - Indexes on both foreign keys for efficient joins
 */

import { relations } from "drizzle-orm";
import { index, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { tools } from "./tools";

// Junction table: tools <-> categories (many-to-many)
export const toolsCategories = pgTable(
	"tools_categories",
	{
		toolId: uuid("tool_id")
			.notNull()
			.references(() => tools.id, { onDelete: "cascade" }),
		categoryId: uuid("category_id")
			.notNull()
			.references(() => categories.id, { onDelete: "cascade" }),
	},
	(table) => [
		primaryKey({ columns: [table.toolId, table.categoryId] }),
		index("tools_categories_tool_idx").on(table.toolId),
		index("tools_categories_category_idx").on(table.categoryId),
	],
);

// Junction table relations
export const toolsCategoriesRelations = relations(
	toolsCategories,
	({ one }) => ({
		tool: one(tools, {
			fields: [toolsCategories.toolId],
			references: [tools.id],
		}),
		category: one(categories, {
			fields: [toolsCategories.categoryId],
			references: [categories.id],
		}),
	}),
);

export type ToolCategory = typeof toolsCategories.$inferSelect;
export type NewToolCategory = typeof toolsCategories.$inferInsert;
