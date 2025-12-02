import type { Category } from "@missingstack/db/schema/categories";

// Category with computed tool count
export type CategoryWithCount = Category & {
	toolCount: number;
};

export interface CategoryRepositoryInterface {
	getAll(): Promise<Category[]>;
	getById(id: string): Promise<Category | null>;
	getBySlug(slug: string): Promise<Category | null>;
	getAllWithCounts(): Promise<CategoryWithCount[]>;
	getTopCategories(limit?: number): Promise<CategoryWithCount[]>;
}

export interface CategoriesServiceInterface {
	getAll(): Promise<Category[]>;
	getById(id: string): Promise<Category | null>;
	getBySlug(slug: string): Promise<Category | null>;
	getAllWithCounts(): Promise<CategoryWithCount[]>;
	getTopCategories(limit?: number): Promise<CategoryWithCount[]>;
}
