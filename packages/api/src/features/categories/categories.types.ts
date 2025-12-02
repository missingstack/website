import type { Category } from "@missingstack/db/schema/categories";
import type {
	CategoryCollection,
	CategoryQueryOptions,
} from "./categories.schema";

// Category with computed tool count
export type CategoryWithCount = Category & {
	toolCount: number;
};

export interface CategoryRepositoryInterface {
	getAll(options?: CategoryQueryOptions): Promise<CategoryCollection>;
	getById(id: string): Promise<Category | null>;
	getBySlug(slug: string): Promise<Category | null>;
	getAllWithCounts(): Promise<CategoryWithCount[]>;
	getTopCategories(limit?: number): Promise<CategoryWithCount[]>;
}

export interface CategoriesServiceInterface {
	getAll(options?: CategoryQueryOptions): Promise<CategoryCollection>;
	getById(id: string): Promise<Category | null>;
	getBySlug(slug: string): Promise<Category | null>;
	getAllWithCounts(): Promise<CategoryWithCount[]>;
	getTopCategories(limit?: number): Promise<CategoryWithCount[]>;
}
