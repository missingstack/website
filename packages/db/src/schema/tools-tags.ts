/**
 * Tools Tags Junction Table
 *
 * Many-to-many relationship between tools and tags.
 * Allows tools to have multiple tags for flexible categorization.
 *
 * Performance optimizations:
 * - Composite primary key on (tool_id, tag_id)
 * - Indexes on both foreign keys for efficient joins
 */

import { relations } from "drizzle-orm";
import { index, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { tags } from "./tags";
import { tools } from "./tools";

// Junction table: tools <-> tags (many-to-many)
export const toolsTags = pgTable(
	"tools_tags",
	{
		toolId: uuid("tool_id")
			.notNull()
			.references(() => tools.id, { onDelete: "cascade", onUpdate: "cascade" }),
		tagId: uuid("tag_id")
			.notNull()
			.references(() => tags.id, { onDelete: "cascade", onUpdate: "cascade" }),
	},
	(table) => [
		primaryKey({ columns: [table.toolId, table.tagId] }),
		index("tools_tags_tool_idx").on(table.toolId),
		index("tools_tags_tag_idx").on(table.tagId),
	],
);

// Junction table relations
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

export type ToolTag = typeof toolsTags.$inferSelect;
export type NewToolTag = typeof toolsTags.$inferInsert;
