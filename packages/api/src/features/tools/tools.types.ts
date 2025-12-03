import type { BaseQueryOptions } from "@missingstack/api/shared";
import type { Tool } from "@missingstack/api/types";
import type {
	CreateToolInput,
	ToolCollection,
	ToolData,
	ToolQueryOptions,
	ToolWithAlternativeCountCollection,
	UpdateToolInput,
} from "./tools.schema";

export type {
	ToolCollection,
	ToolData,
	ToolQueryOptions,
	ToolWithAlternativeCountCollection,
};

export type ToolWithCategories = Tool & { categoryNames: string[] };

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
	getAllWithAlternativeCounts(
		options?: ToolQueryOptions,
	): Promise<ToolWithAlternativeCountCollection>;
	getByDateRange(startDate: Date, endDate: Date): Promise<ToolWithCategories[]>;
	create(input: CreateToolInput): Promise<ToolData>;
	update(id: string, input: UpdateToolInput): Promise<ToolData>;
	delete(id: string): Promise<void>;
}

export type { CreateToolInput, UpdateToolInput } from "./tools.schema";

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
	getAllWithAlternativeCounts(
		options?: ToolQueryOptions,
	): Promise<ToolWithAlternativeCountCollection>;
	getByDateRange(startDate: Date, endDate: Date): Promise<ToolWithCategories[]>;
	create(input: CreateToolInput): Promise<ToolData>;
	update(id: string, input: UpdateToolInput): Promise<ToolData>;
	delete(id: string): Promise<void>;
}
