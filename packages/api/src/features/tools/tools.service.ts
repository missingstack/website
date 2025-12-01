import type { Tool } from "@missingstack/api/types";
import type {
	ToolCollection,
	ToolData,
	ToolQueryOptions,
	ToolRepositoryInterface,
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
}

function clampLimit(limit?: number): number {
	if (!limit) return DEFAULT_LIMIT;
	return Math.min(Math.max(limit, 1), MAX_LIMIT);
}

function clampPresetLimit(limit?: number): number {
	if (!limit) return 10;
	return Math.min(Math.max(limit, 1), MAX_PRESET_LIMIT);
}
