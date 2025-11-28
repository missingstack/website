import type {
	ToolQueryOptions,
	ToolRepositoryInterface,
	ToolsServiceInterface,
} from "./tools.types";

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 50;

export class ToolsService implements ToolsServiceInterface {
	constructor(private readonly repository: ToolRepositoryInterface) {}

	async getAllTools(options: ToolQueryOptions = {}) {
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
			platforms:
				options.platforms && options.platforms.length > 0
					? options.platforms
					: undefined,
			pricing:
				options.pricing && options.pricing.length > 0
					? options.pricing
					: undefined,
			// Trim search term
			search: options.search?.trim() || undefined,
		};

		return this.repository.getAllTools(sanitizedOptions);
	}
}

function clampLimit(limit?: number) {
	if (!limit) return DEFAULT_LIMIT;
	return Math.min(Math.max(limit, 1), MAX_LIMIT);
}
