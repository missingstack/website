/**
 * Categories Stacks Junction Table
 *
 * Many-to-many relationship between categories and stacks.
 * Allows categories to belong to multiple technology stacks.
 *
 * Performance optimizations:
 * - Composite primary key on (category_id, stack_id)
 * - Indexes on both foreign keys for efficient joins
 */

import { relations } from "drizzle-orm";
import { index, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { stacks } from "./stacks";

// Junction table: categories <-> stacks (many-to-many)
export const categoriesStacks = pgTable(
	"categories_stacks",
	{
		categoryId: uuid("category_id")
			.notNull()
			.references(() => categories.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
		stackId: uuid("stack_id")
			.notNull()
			.references(() => stacks.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
	},
	(table) => [
		primaryKey({ columns: [table.categoryId, table.stackId] }),
		index("categories_stacks_category_idx").on(table.categoryId),
		index("categories_stacks_stack_idx").on(table.stackId),
	],
);

// Junction table relations
export const categoriesStacksRelations = relations(
	categoriesStacks,
	({ one }) => ({
		category: one(categories, {
			fields: [categoriesStacks.categoryId],
			references: [categories.id],
		}),
		stack: one(stacks, {
			fields: [categoriesStacks.stackId],
			references: [stacks.id],
		}),
	}),
);

export type CategoryStack = typeof categoriesStacks.$inferSelect;
export type NewCategoryStack = typeof categoriesStacks.$inferInsert;
