/**
 * Tools Schema
 *
 * Main table for all tools/products in the directory.
 * Uses junction tables for many-to-many relationships.
 *
 * Performance optimizations:
 * - Full-text search via tsvector column with GIN index
 * - Composite indexes for common filter combinations
 * - Covering indexes for pagination queries
 */

import { relations } from "drizzle-orm";
import {
	boolean,
	customType,
	index,
	pgTable,
	primaryKey,
	text,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { timestampFields, uuidPrimaryKey } from "./base";
import { categories } from "./categories";
import { pricingEnum } from "./enums";
import { tags } from "./tags";

// Custom type for PostgreSQL tsvector (full-text search)
const tsvector = customType<{ data: string }>({
	dataType() {
		return "tsvector";
	},
});

// Main tools table
export const tools = pgTable(
	"tools",
	{
		...uuidPrimaryKey,
		slug: varchar("slug", { length: 120 }).notNull().unique(),
		name: varchar("name", { length: 160 }).notNull(),
		tagline: varchar("tagline", { length: 256 }),
		description: text("description").notNull(),
		logo: varchar("logo", { length: 256 }).notNull(),
		website: varchar("website", { length: 256 }),
		pricing: pricingEnum("pricing").notNull(),
		featured: boolean("featured").default(false),
		// Full-text search vector - auto-generated from name, tagline, description
		searchVector: tsvector("search_vector"),
		...timestampFields,
	},
	(table) => [
		// Single column indexes
		index("tools_slug_idx").on(table.slug),
		index("tools_name_idx").on(table.name),
		// Composite indexes for common query patterns
		index("tools_featured_created_idx").on(table.featured, table.createdAt),
		index("tools_pricing_created_idx").on(table.pricing, table.createdAt),
		index("tools_featured_pricing_idx").on(table.featured, table.pricing),
		// GIN index for full-text search
		index("tools_search_idx").using("gin", table.searchVector),
	],
);

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

// Junction table: tools <-> tags (many-to-many)
export const toolsTags = pgTable(
	"tools_tags",
	{
		toolId: uuid("tool_id")
			.notNull()
			.references(() => tools.id, { onDelete: "cascade" }),
		tagId: uuid("tag_id")
			.notNull()
			.references(() => tags.id, { onDelete: "cascade" }),
	},
	(table) => [
		primaryKey({ columns: [table.toolId, table.tagId] }),
		index("tools_tags_tool_idx").on(table.toolId),
		index("tools_tags_tag_idx").on(table.tagId),
	],
);

// Tools relations
export const toolsRelations = relations(tools, ({ many }) => ({
	categories: many(toolsCategories),
	tags: many(toolsTags),
}));

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

export const toolsTagsRelations = relations(toolsTags, ({ one }) => ({
	tool: one(tools, {
		fields: [toolsTags.toolId],
		references: [tools.id],
	}),
	tag: one(tags, {
		fields: [toolsTags.tagId],
		references: [tags.id],
	}),
}));

export type Tool = typeof tools.$inferSelect;
export type NewTool = typeof tools.$inferInsert;
export type ToolCategory = typeof toolsCategories.$inferSelect;
export type ToolTag = typeof toolsTags.$inferSelect;
