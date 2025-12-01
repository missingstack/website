/**
 * Tool Affiliate Links Schema
 *
 * Tracks affiliate URLs and commission data for tools.
 * Supports multiple affiliate programs per tool with primary/secondary designation.
 */

import { relations } from "drizzle-orm";
import {
	boolean,
	decimal,
	index,
	integer,
	pgTable,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { timestampFields, uuidPrimaryKey } from "./base";
import { tools } from "./tools";

// Tool affiliate links table
export const toolAffiliateLinks = pgTable(
	"tool_affiliate_links",
	{
		...uuidPrimaryKey,
		toolId: uuid("tool_id")
			.notNull()
			.references(() => tools.id, { onDelete: "cascade" }),
		affiliateUrl: varchar("affiliate_url", { length: 512 }).notNull(),
		// Commission rate as decimal (e.g., 0.20 = 20%)
		commissionRate: decimal("commission_rate", {
			precision: 5,
			scale: 4,
		}).default("0"),
		// Tracking code for analytics
		trackingCode: varchar("tracking_code", { length: 100 }),
		isPrimary: boolean("is_primary").default(false).notNull(),
		// Click tracking
		clickCount: integer("click_count").default(0).notNull(),
		// Revenue tracked in cents
		revenueTracked: integer("revenue_tracked").default(0).notNull(),
		...timestampFields,
	},
	(table) => [
		index("tool_affiliate_links_tool_idx").on(table.toolId),
		index("tool_affiliate_links_primary_idx").on(table.isPrimary),
		index("tool_affiliate_links_tool_primary_idx").on(
			table.toolId,
			table.isPrimary,
		),
	],
);

// Tool affiliate links relations
export const toolAffiliateLinksRelations = relations(
	toolAffiliateLinks,
	({ one }) => ({
		tool: one(tools, {
			fields: [toolAffiliateLinks.toolId],
			references: [tools.id],
		}),
	}),
);

export type ToolAffiliateLink = typeof toolAffiliateLinks.$inferSelect;
export type NewToolAffiliateLink = typeof toolAffiliateLinks.$inferInsert;
