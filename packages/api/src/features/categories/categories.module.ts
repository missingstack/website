import type { Database } from "@missingstack/db";
import { DrizzleCategoryRepository } from "./categories.repository";
import { CategoriesService } from "./categories.service";
import type { CategoriesServiceInterface } from "./categories.types";

export function createCategoryService(
	database: Database,
): CategoriesServiceInterface {
	const repository = new DrizzleCategoryRepository(database);
	return new CategoriesService(repository);
}
