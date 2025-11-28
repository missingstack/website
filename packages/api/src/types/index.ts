/**
 * Centralized type exports for the API package
 *
 * This file aggregates all public types from feature modules,
 * providing a single import point for consumers (like the web app).
 *
 * Benefits:
 * - Single import source: import type { ToolData, Category } from "@missingstack/api/types"
 * - Type composition: BaseQueryOptions is composed into feature-specific query types
 * - No duplication: Types are defined once in their feature modules and re-exported here
 * - Easy to discover: All available types are listed in one place
 *
 * Usage:
 *   import type { ToolData, Category, BaseQueryOptionsString } from "@missingstack/api/types";
 */

export type { Category } from "@missingstack/db/schema/categories";
export type { PricingModel } from "@missingstack/db/schema/enums";
export type { Tag } from "@missingstack/db/schema/tags";
export type { Tool } from "@missingstack/db/schema/tools";

export type {
	CategoriesServiceInterface,
	CategoryRepositoryInterface,
} from "../features/categories";
export type {
	Section,
	SectionRepositoryInterface,
	SectionsServiceInterface,
} from "../features/sections";
export type {
	Stats,
	StatsRepositoryInterface,
	StatsServiceInterface,
} from "../features/stats";
export type {
	TagRepositoryInterface,
	TagsServiceInterface,
} from "../features/tags";
export type {
	ToolCollection,
	ToolData,
	ToolQueryOptions,
	ToolRepositoryInterface,
	ToolsServiceInterface,
} from "../features/tools";

// Shared types (used for composition)
export type { BaseQueryOptions } from "../shared/query-options.schema";
