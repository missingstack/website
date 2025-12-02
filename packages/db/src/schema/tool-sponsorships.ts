/**
 * Tool Sponsorships Schema
 *
 * Manages sponsored/featured listings for tools.
 * Supports time-limited campaigns with priority weighting for ranking.
 */

import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgTable,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { timestampFields, uuidPrimaryKey } from "./base";
import { paymentStatusEnum, sponsorshipTierEnum } from "./enums";
import { tools } from "./tools";

// Tool sponsorships table
export const toolSponsorships = pgTable(
	"tool_sponsorships",
	{
		...uuidPrimaryKey,
		toolId: uuid("tool_id")
			.notNull()
			.references(() => tools.id, { onDelete: "cascade" }),
		tier: sponsorshipTierEnum("tier").notNull(),
		startDate: timestamp("start_date", { withTimezone: true }).notNull(),
		endDate: timestamp("end_date", { withTimezone: true }).notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		// Priority weight for ranking (higher = appears first)
		priorityWeight: integer("priority_weight").default(0).notNull(),
		// Payment status
		paymentStatus: paymentStatusEnum("payment_status")
			.default("pending")
			.notNull(),
		...timestampFields,
	},
	(table) => [
		index("tool_sponsorships_tool_idx").on(table.toolId),
		index("tool_sponsorships_active_idx").on(table.isActive),
		index("tool_sponsorships_end_date_idx").on(table.endDate),
		index("tool_sponsorships_active_end_date_idx").on(
			table.isActive,
			table.endDate,
		),
		index("tool_sponsorships_priority_weight_idx").on(table.priorityWeight),
		// Composite index for active sponsorships with priority
		index("tool_sponsorships_active_priority_idx").on(
			table.isActive,
			table.priorityWeight,
		),
		// Index for date range queries
		index("tool_sponsorships_start_date_idx").on(table.startDate),
		// Index for payment status queries
		index("tool_sponsorships_payment_status_idx").on(table.paymentStatus),
		// Note: Check constraint for date validation should be added via migration:
		// CHECK (end_date > start_date)
	],
);

// Tool sponsorships relations
export const toolSponsorshipsRelations = relations(
	toolSponsorships,
	({ one }) => ({
		tool: one(tools, {
			fields: [toolSponsorships.toolId],
			references: [tools.id],
		}),
	}),
);

export type ToolSponsorship = typeof toolSponsorships.$inferSelect;
export type NewToolSponsorship = typeof toolSponsorships.$inferInsert;
