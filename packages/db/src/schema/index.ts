/**
 * Drizzle Schema Index
 *
 * Exports all schema definitions for the database.
 * This is the single entry point for all schema-related imports.
 */

export * from "./categories";
export * from "./enums";
export * from "./tags";
export * from "./tool-affiliate-links";
export * from "./tool-sponsorships";
export * from "./tools";

import { categories, categoriesRelations } from "./categories";
import {
	badgeVariantEnum,
	iconColorEnum,
	platformEnum,
	pricingEnum,
	sectionFilterEnum,
	sectionLayoutEnum,
	sectionTypeEnum,
	sponsorshipTierEnum,
	tagTypeEnum,
} from "./enums";
import { tags } from "./tags";
import {
	toolAffiliateLinks,
	toolAffiliateLinksRelations,
} from "./tool-affiliate-links";
import {
	toolSponsorships,
	toolSponsorshipsRelations,
} from "./tool-sponsorships";
import {
	tools,
	toolsCategories,
	toolsCategoriesRelations,
	toolsRelations,
	toolsTags,
	toolsTagsRelations,
} from "./tools";

export const schema = {
	// Enums
	platformEnum,
	pricingEnum,
	tagTypeEnum,
	badgeVariantEnum,
	sectionTypeEnum,
	sectionFilterEnum,
	sectionLayoutEnum,
	iconColorEnum,
	sponsorshipTierEnum,

	// Tables
	categories,
	tags,
	tools,
	toolsCategories,
	toolsTags,
	toolSponsorships,
	toolAffiliateLinks,

	// Relations
	categoriesRelations,
	toolsRelations,
	toolsCategoriesRelations,
	toolsTagsRelations,
	toolSponsorshipsRelations,
	toolAffiliateLinksRelations,
};

export default schema;
