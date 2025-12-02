/**
 * Tools Alternatives Junction Table
 *
 * Many-to-many self-referential relationship for alternative tools.
 * Allows tools to have multiple alternative tools and vice versa.
 *
 * Performance optimizations:
 * - Composite primary key on (tool_id, alternative_tool_id)
 * - Indexes on both foreign keys for efficient joins
 * - Composite index for efficient bidirectional lookups
 */

import { relations } from "drizzle-orm";
import { index, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { tools } from "./tools";

// Junction table: tools <-> alternative tools (many-to-many, self-referential)
export const toolsAlternatives = pgTable(
	"tools_alternatives",
	{
		toolId: uuid("tool_id")
			.notNull()
			.references(() => tools.id, { onDelete: "cascade" }),
		alternativeToolId: uuid("alternative_tool_id")
			.notNull()
			.references(() => tools.id, { onDelete: "cascade" }),
	},
	(table) => [
		primaryKey({ columns: [table.toolId, table.alternativeToolId] }),
		index("tools_alternatives_tool_idx").on(table.toolId),
		index("tools_alternatives_alternative_idx").on(table.alternativeToolId),
		// Composite index for efficient bidirectional lookups
		index("tools_alternatives_bidirectional_idx").on(
			table.toolId,
			table.alternativeToolId,
		),
	],
);

// Junction table relations
export const toolsAlternativesRelations = relations(
	toolsAlternatives,
	({ one }) => ({
		tool: one(tools, {
			fields: [toolsAlternatives.toolId],
			references: [tools.id],
			relationName: "alternatives",
		}),
		alternativeTool: one(tools, {
			fields: [toolsAlternatives.alternativeToolId],
			references: [tools.id],
			relationName: "alternativeOf",
		}),
	}),
);

export type ToolAlternative = typeof toolsAlternatives.$inferSelect;
export type NewToolAlternative = typeof toolsAlternatives.$inferInsert;
