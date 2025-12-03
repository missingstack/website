import type { Tool } from "@missingstack/api/types";
import type { CreateToolInput, UpdateToolInput } from "./tools.schema";
import type {
	ToolCollection,
	ToolData,
	ToolQueryOptions,
	ToolRepositoryInterface,
	ToolWithAlternativeCountCollection,
	ToolWithCategories,
	ToolsServiceInterface,
} from "./tools.types";

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 50;
const MAX_PRESET_LIMIT = 100;

export class ToolsService implements ToolsServiceInterface {
	constructor(private readonly repository: ToolRepositoryInterface) {}

	async getAll(options: ToolQueryOptions = {}): Promise<ToolCollection> {
		// Sanitize and validate options
		const sanitizedOptions: ToolQueryOptions = {
			...options,
			cursor: options.cursor ?? null,
			limit: clampLimit(options.limit),
			sortBy: options.sortBy ?? "newest",
			sortOrder: options.sortOrder ?? "desc",
			includeRelations: options.includeRelations ?? true,
			// Filter out empty arrays
			categoryIds:
				options.categoryIds && options.categoryIds.length > 0
					? options.categoryIds
					: undefined,
			tagIds:
				options.tagIds && options.tagIds.length > 0
					? options.tagIds
					: undefined,
			stackIds:
				options.stackIds && options.stackIds.length > 0
					? options.stackIds
					: undefined,
			alternativeIds:
				options.alternativeIds && options.alternativeIds.length > 0
					? options.alternativeIds
					: undefined,
			license:
				options.license && options.license.length > 0
					? options.license
					: undefined,
			pricing:
				options.pricing && options.pricing.length > 0
					? options.pricing
					: undefined,
			// Trim search term
			search: options.search?.trim() || undefined,
		};

		return this.repository.getAll(sanitizedOptions);
	}

	async getByCategory(
		categoryId: string,
		options: ToolQueryOptions = {},
	): Promise<ToolCollection> {
		return this.repository.getByCategory(categoryId, options);
	}

	async getByTag(
		tagId: string,
		options: ToolQueryOptions = {},
	): Promise<ToolCollection> {
		return this.repository.getByTag(tagId, options);
	}

	async getByStack(
		stackId: string,
		options: ToolQueryOptions = {},
	): Promise<ToolCollection> {
		return this.repository.getByStack(stackId, options);
	}

	async getByAlternative(
		alternativeId: string,
		options: ToolQueryOptions = {},
	): Promise<ToolCollection> {
		return this.repository.getByAlternative(alternativeId, options);
	}

	async search(
		query: string,
		options: ToolQueryOptions = {},
	): Promise<ToolCollection> {
		const trimmedQuery = query.trim();
		if (!trimmedQuery) {
			return { items: [], nextCursor: null, hasMore: false };
		}
		return this.repository.search(trimmedQuery, options);
	}

	async getById(id: string): Promise<ToolData | null> {
		return this.repository.getById(id);
	}

	async getBySlug(slug: string): Promise<ToolData | null> {
		return this.repository.getBySlug(slug);
	}

	async getFeatured(limit?: number): Promise<Tool[]> {
		const clampedLimit = clampPresetLimit(limit);
		return this.repository.getFeatured(clampedLimit);
	}

	async getRecent(limit?: number): Promise<Tool[]> {
		const clampedLimit = clampPresetLimit(limit);
		return this.repository.getRecent(clampedLimit);
	}

	async getPopular(limit?: number): Promise<Tool[]> {
		const clampedLimit = clampPresetLimit(limit);
		return this.repository.getPopular(clampedLimit);
	}

	async getAllWithAlternativeCounts(
		options: ToolQueryOptions = {},
	): Promise<ToolWithAlternativeCountCollection> {
		// Sanitize and validate options
		const sanitizedOptions: ToolQueryOptions = {
			...options,
			cursor: options.cursor ?? null,
			limit: clampLimit(options.limit),
			sortBy: options.sortBy ?? "newest",
			sortOrder: options.sortOrder ?? "desc",
			includeRelations: options.includeRelations ?? true,
			// Filter out empty arrays
			categoryIds:
				options.categoryIds && options.categoryIds.length > 0
					? options.categoryIds
					: undefined,
			tagIds:
				options.tagIds && options.tagIds.length > 0
					? options.tagIds
					: undefined,
			stackIds:
				options.stackIds && options.stackIds.length > 0
					? options.stackIds
					: undefined,
			alternativeIds:
				options.alternativeIds && options.alternativeIds.length > 0
					? options.alternativeIds
					: undefined,
			license:
				options.license && options.license.length > 0
					? options.license
					: undefined,
			pricing:
				options.pricing && options.pricing.length > 0
					? options.pricing
					: undefined,
			// Trim search term
			search: options.search?.trim() || undefined,
		};

		return this.repository.getAllWithAlternativeCounts(sanitizedOptions);
	}

	async create(input: CreateToolInput): Promise<ToolData> {
		return this.repository.create(input);
	}

	async update(id: string, input: UpdateToolInput): Promise<ToolData> {
		return this.repository.update(id, input);
	}

	async delete(id: string): Promise<void> {
		return this.repository.delete(id);
	}

	async getByDateRange(
		startDate: Date,
		endDate: Date,
	): Promise<ToolWithCategories[]> {
		return this.repository.getByDateRange(startDate, endDate);
	}
}

function clampLimit(limit?: number): number {
	if (!limit) return DEFAULT_LIMIT;
	return Math.min(Math.max(limit, 1), MAX_LIMIT);
}

function clampPresetLimit(limit?: number): number {
	if (!limit) return 10;
	return Math.min(Math.max(limit, 1), MAX_PRESET_LIMIT);
}
