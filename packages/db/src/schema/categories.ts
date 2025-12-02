/**
 * Categories Schema
 *
 * Categories are the primary way to organize tools.
 * Supports hierarchical categories with parent-child relationships.
 *
 * Performance optimizations:
 * - Composite index for weight + name sorting
 * - Tool counts computed via efficient COUNT queries with indexed junction tables
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
import { toolsCategories } from "./tools-categories";

// Categories table
export const categories = pgTable(
	"categories",
	{
		...uuidPrimaryKey,
		slug: varchar("slug", { length: 120 }).notNull().unique(),
		name: varchar("name", { length: 160 }).notNull(),
		description: text("description"),
		icon: varchar("icon", { length: 100 }).notNull(), // Lucide icon name
		parentId: uuid("parent_id").references((): AnyPgColumn => categories.id),
		weight: integer("weight").default(0),
		...timestampFields,
	},
	(table) => [
		index("categories_slug_idx").on(table.slug),
		index("categories_parent_idx").on(table.parentId),
		index("categories_weight_name_idx").on(table.weight, table.name),
	],
);

// Category relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
	parent: one(categories, {
		fields: [categories.parentId],
		references: [categories.id],
		relationName: "parentCategory",
	}),
	children: many(categories, {
		relationName: "parentCategory",
	}),
	tools: many(toolsCategories),
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
