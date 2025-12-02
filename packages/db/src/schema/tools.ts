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
	integer,
	pgTable,
	text,
	varchar,
} from "drizzle-orm/pg-core";
import { timestampFields, uuidPrimaryKey } from "./base";
import { licenseEnum, pricingEnum } from "./enums";
import { toolAffiliateLinks } from "./tool-affiliate-links";
import { toolSponsorships } from "./tool-sponsorships";
import { toolsAlternatives } from "./tools-alternatives";
import { toolsCategories } from "./tools-categories";
import { toolsStacks } from "./tools-stacks";
import { toolsTags } from "./tools-tags";

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
		license: licenseEnum("license"),
		featured: boolean("featured").default(false),

		// Monetization fields
		affiliateUrl: varchar("affiliate_url", { length: 512 }),
		sponsorshipPriority: integer("sponsorship_priority").default(0).notNull(),
		isSponsored: boolean("is_sponsored").default(false).notNull(),
		monetizationEnabled: boolean("monetization_enabled")
			.default(false)
			.notNull(),
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
		index("tools_license_idx").on(table.license),
		index("tools_pricing_license_idx").on(table.pricing, table.license),
		index("tools_sponsorship_priority_idx").on(table.sponsorshipPriority),
		index("tools_is_sponsored_idx").on(table.isSponsored),
		// Composite index for featured + sponsored queries
		index("tools_featured_sponsored_idx").on(table.featured, table.isSponsored),
		// Index for monetization queries
		index("tools_monetization_enabled_idx").on(table.monetizationEnabled),
		// GIN index for full-text search
		index("tools_search_idx").using("gin", table.searchVector),
	],
);

// Tools relations
export const toolsRelations = relations(tools, ({ many }) => ({
	categories: many(toolsCategories),
	stacks: many(toolsStacks),
	tags: many(toolsTags),
	alternatives: many(toolsAlternatives, {
		relationName: "alternatives",
	}),
	alternativeOf: many(toolsAlternatives, {
		relationName: "alternativeOf",
	}),
	sponsorships: many(toolSponsorships),
	affiliateLinks: many(toolAffiliateLinks),
}));

export type Tool = typeof tools.$inferSelect;
export type NewTool = typeof tools.$inferInsert;
