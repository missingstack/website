import type { Category } from "@missingstack/db/schema/categories";

export type CategoryData = Pick<
	Category,
	"id" | "slug" | "name" | "description" | "icon" | "parentId" | "weight"
>;

export interface CategoryWithCount extends CategoryData {
	toolCount: number;
}

export interface CategoryRepositoryInterface {
	getAll(): Promise<CategoryData[]>;
	getById(id: string): Promise<CategoryData | null>;
	getBySlug(slug: string): Promise<CategoryData | null>;
	getAllWithCounts(): Promise<CategoryWithCount[]>;
	getTopCategories(limit?: number): Promise<CategoryWithCount[]>;
}

export interface CategoriesServiceInterface {
	getAll(): Promise<CategoryData[]>;
	getById(id: string): Promise<CategoryData | null>;
	getBySlug(slug: string): Promise<CategoryData | null>;
	getAllWithCounts(): Promise<CategoryWithCount[]>;
	getTopCategories(limit?: number): Promise<CategoryWithCount[]>;
}
