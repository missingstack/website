/**
 * Drizzle Schema Index
 *
 * Exports all schema definitions for the database.
 * This is the single entry point for all schema-related imports.
 */

export * from "./categories";
export * from "./enums";
export * from "./tags";
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
	tagTypeEnum,
} from "./enums";
import { tags } from "./tags";
import {
	tools,
	toolsCategories,
	toolsCategoriesRelations,
	toolsPlatforms,
	toolsPlatformsRelations,
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

	// Tables
	categories,
	tags,
	tools,
	toolsCategories,
	toolsTags,
	toolsPlatforms,

	// Relations
	categoriesRelations,
	toolsRelations,
	toolsCategoriesRelations,
	toolsTagsRelations,
	toolsPlatformsRelations,
};

export default schema;
