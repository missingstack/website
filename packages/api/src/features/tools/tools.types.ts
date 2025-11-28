import type { Tool } from "@missingstack/db/schema/tools";
import type {
	QueryOptions as QueryOptionsSchema,
	ToolCollection as ToolCollectionSchema,
	ToolQueryOptions as ToolQueryOptionsSchema,
} from "./tools.schema";

export type ToolCollection = ToolCollectionSchema;
export type ToolQueryOptions = ToolQueryOptionsSchema;
export type QueryOptions = QueryOptionsSchema;

export type ToolEntity = Pick<
	Tool,
	| "id"
	| "slug"
	| "name"
	| "tagline"
	| "description"
	| "logo"
	| "website"
	| "pricing"
	| "featured"
	| "createdAt"
	| "updatedAt"
>;

// Lightweight tool data without relations - for list views
export type ToolDataLite = ToolEntity;

// Full tool data with relations - for detail views
export interface ToolData extends ToolEntity {
	categoryIds: string[];
	tagIds: string[];
	platforms: string[];
}

export interface ToolRepositoryInterface {
	// List queries - return lite data by default, full data when includeRelations=true
	getAll(options?: ToolQueryOptions): Promise<ToolCollection>;
	getByCategory(
		categoryId: string,
		options?: QueryOptions,
	): Promise<ToolCollection>;
	getByTag(tagId: string, options?: QueryOptions): Promise<ToolCollection>;
	search(query: string, options?: QueryOptions): Promise<ToolCollection>;
	// Single item queries - always return full data with relations
	getById(id: string): Promise<ToolData | null>;
	getBySlug(slug: string): Promise<ToolData | null>;
	// Optimized preset queries - return lite data (no extra queries)
	getFeatured(limit?: number): Promise<ToolDataLite[]>;
	getRecent(limit?: number): Promise<ToolDataLite[]>;
	getPopular(limit?: number): Promise<ToolDataLite[]>;
}

export interface ToolsServiceInterface {
	// List queries
	getAll(options?: ToolQueryOptions): Promise<ToolCollection>;
	getByCategory(
		categoryId: string,
		options?: QueryOptions,
	): Promise<ToolCollection>;
	getByTag(tagId: string, options?: QueryOptions): Promise<ToolCollection>;
	search(query: string, options?: QueryOptions): Promise<ToolCollection>;
	// Single item queries
	getById(id: string): Promise<ToolData | null>;
	getBySlug(slug: string): Promise<ToolData | null>;
	// Preset queries
	getFeatured(limit?: number): Promise<ToolDataLite[]>;
	getRecent(limit?: number): Promise<ToolDataLite[]>;
	getPopular(limit?: number): Promise<ToolDataLite[]>;
}
