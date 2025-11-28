import type { Category } from "@missingstack/db/schema/categories";

export interface CategoryRepositoryInterface {
	getAll(): Promise<Category[]>;
	getById(id: string): Promise<Category | null>;
	getBySlug(slug: string): Promise<Category | null>;
	getAllWithCounts(): Promise<Category[]>;
	getTopCategories(limit?: number): Promise<Category[]>;
}

export interface CategoriesServiceInterface {
	getAll(): Promise<Category[]>;
	getById(id: string): Promise<Category | null>;
	getBySlug(slug: string): Promise<Category | null>;
	getAllWithCounts(): Promise<Category[]>;
	getTopCategories(limit?: number): Promise<Category[]>;
}
