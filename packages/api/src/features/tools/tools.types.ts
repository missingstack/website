import type { BaseQueryOptions } from "@missingstack/api/shared";
import type { Tool } from "@missingstack/api/types";
import type {
	ToolCollection,
	ToolData,
	ToolQueryOptions,
} from "./tools.schema";

export type { ToolCollection, ToolData, ToolQueryOptions };

export interface ToolRepositoryInterface {
	getAll(options?: ToolQueryOptions): Promise<ToolCollection>;
	getByCategory(
		categoryId: string,
		options?: ToolQueryOptions,
	): Promise<ToolCollection>;
	getByTag(tagId: string, options?: ToolQueryOptions): Promise<ToolCollection>;
	getByStack(
		stackId: string,
		options?: ToolQueryOptions,
	): Promise<ToolCollection>;
	getByAlternative(
		alternativeId: string,
		options?: ToolQueryOptions,
	): Promise<ToolCollection>;
	search(query: string, options?: BaseQueryOptions): Promise<ToolCollection>;
	getById(id: string): Promise<ToolData | null>;
	getBySlug(slug: string): Promise<ToolData | null>;
	getFeatured(limit?: number): Promise<Tool[]>;
	getRecent(limit?: number): Promise<Tool[]>;
	getPopular(limit?: number): Promise<Tool[]>;
}

export interface ToolsServiceInterface {
	getAll(options?: ToolQueryOptions): Promise<ToolCollection>;
	getByCategory(
		categoryId: string,
		options?: ToolQueryOptions,
	): Promise<ToolCollection>;
	getByTag(tagId: string, options?: ToolQueryOptions): Promise<ToolCollection>;
	getByStack(
		stackId: string,
		options?: ToolQueryOptions,
	): Promise<ToolCollection>;
	getByAlternative(
		alternativeId: string,
		options?: ToolQueryOptions,
	): Promise<ToolCollection>;
	search(query: string, options?: BaseQueryOptions): Promise<ToolCollection>;
	getById(id: string): Promise<ToolData | null>;
	getBySlug(slug: string): Promise<ToolData | null>;
	getFeatured(limit?: number): Promise<Tool[]>;
	getRecent(limit?: number): Promise<Tool[]>;
	getPopular(limit?: number): Promise<Tool[]>;
}
