/**
 * Drizzle Schema Index
 *
 * Exports all schema definitions for the database.
 * This is the single entry point for all schema-related imports.
 */

export * from "./categories";
export * from "./categories-stacks";
export * from "./enums";
export * from "./stacks";
export * from "./tags";
export * from "./tool-affiliate-links";
export * from "./tool-sponsorships";
export * from "./tools";
export * from "./tools-alternatives";
export * from "./tools-categories";
export * from "./tools-stacks";
export * from "./tools-tags";

import { categories, categoriesRelations } from "./categories";
import {
	categoriesStacks,
	categoriesStacksRelations,
} from "./categories-stacks";
import {
	badgeVariantEnum,
	iconColorEnum,
	licenseEnum,
	paymentStatusEnum,
	platformEnum,
	pricingEnum,
	sectionFilterEnum,
	sectionLayoutEnum,
	sectionTypeEnum,
	sponsorshipTierEnum,
	tagTypeEnum,
} from "./enums";
import { stacks, stacksRelations } from "./stacks";
import { tags, tagsRelations } from "./tags";
import {
	toolAffiliateLinks,
	toolAffiliateLinksRelations,
} from "./tool-affiliate-links";
import {
	toolSponsorships,
	toolSponsorshipsRelations,
} from "./tool-sponsorships";
import { tools, toolsRelations } from "./tools";
import {
	toolsAlternatives,
	toolsAlternativesRelations,
} from "./tools-alternatives";
import { toolsCategories, toolsCategoriesRelations } from "./tools-categories";
import { toolsStacks, toolsStacksRelations } from "./tools-stacks";
import { toolsTags, toolsTagsRelations } from "./tools-tags";

export const schema = {
	// Enums
	platformEnum,
	pricingEnum,
	licenseEnum,
	paymentStatusEnum,
	tagTypeEnum,
	badgeVariantEnum,
	sectionTypeEnum,
	sectionFilterEnum,
	sectionLayoutEnum,
	iconColorEnum,
	sponsorshipTierEnum,

	// Tables
	categories,
	stacks,
	tags,
	tools,
	categoriesStacks,
	toolsCategories,
	toolsTags,
	toolsStacks,
	toolsAlternatives,
	toolSponsorships,
	toolAffiliateLinks,

	// Relations
	categoriesRelations,
	stacksRelations,
	tagsRelations,
	toolsRelations,
	categoriesStacksRelations,
	toolsCategoriesRelations,
	toolsTagsRelations,
	toolsStacksRelations,
	toolsAlternativesRelations,
	toolSponsorshipsRelations,
	toolAffiliateLinksRelations,
};

export default schema;
