import type { EntityWith } from "@missingstack/api/shared";
import type { Category } from "@missingstack/db/schema/categories";
import type {
	CategoryCollection,
	CategoryQueryOptions,
	CreateCategoryInput,
	UpdateCategoryInput,
} from "./categories.schema";
// Convenience type alias for Category extensions
export type CategoryWith<P = Record<string, unknown>> = EntityWith<Category, P>;
export type CategoryWithCount = CategoryWith<{
	toolCount: number;
}>;

export interface CategoryRepositoryInterface {
	getAll(options?: CategoryQueryOptions): Promise<CategoryCollection>;
	getById(id: string): Promise<Category | null>;
	getBySlug(slug: string): Promise<Category | null>;
	getAllWithCounts(): Promise<CategoryWithCount[]>;
	getTopCategories(limit?: number): Promise<CategoryWithCount[]>;
	getByStack(stackId: string): Promise<CategoryWithCount[]>;
	create(input: CreateCategoryInput): Promise<Category>;
	update(id: string, input: UpdateCategoryInput): Promise<Category>;
	delete(id: string): Promise<void>;
}

export interface CategoriesServiceInterface {
	getAll(options?: CategoryQueryOptions): Promise<CategoryCollection>;
	getById(id: string): Promise<Category | null>;
	getBySlug(slug: string): Promise<Category | null>;
	getAllWithCounts(): Promise<CategoryWithCount[]>;
	getTopCategories(limit?: number): Promise<CategoryWithCount[]>;
	getByStack(stackId: string): Promise<CategoryWithCount[]>;
	create(input: CreateCategoryInput): Promise<Category>;
	update(id: string, input: UpdateCategoryInput): Promise<Category>;
	delete(id: string): Promise<void>;
}
