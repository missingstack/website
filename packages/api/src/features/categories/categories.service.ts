import type {
	CategoriesServiceInterface,
	CategoryData,
	CategoryRepositoryInterface,
	CategoryWithCount,
} from "./categories.types";

const DEFAULT_TOP_LIMIT = 10;
const MAX_TOP_LIMIT = 100;

export class CategoriesService implements CategoriesServiceInterface {
	constructor(private readonly repository: CategoryRepositoryInterface) {}

	async getAll(): Promise<CategoryData[]> {
		return this.repository.getAll();
	}

	async getById(id: string): Promise<CategoryData | null> {
		return this.repository.getById(id);
	}

	async getBySlug(slug: string): Promise<CategoryData | null> {
		return this.repository.getBySlug(slug);
	}

	async getAllWithCounts(): Promise<CategoryWithCount[]> {
		return this.repository.getAllWithCounts();
	}

	async getTopCategories(limit?: number): Promise<CategoryWithCount[]> {
		const clampedLimit = clampLimit(limit);
		return this.repository.getTopCategories(clampedLimit);
	}
}

function clampLimit(limit?: number): number {
	if (!limit) return DEFAULT_TOP_LIMIT;
	return Math.min(Math.max(limit, 1), MAX_TOP_LIMIT);
}
