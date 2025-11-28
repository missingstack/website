import type { Database } from "@missingstack/db";
import { DrizzleCategoryRepository } from "./categories.repository";
import { CategoriesService } from "./categories.service";
import type { CategoriesServiceInterface } from "./categories.types";

export type CategoryModule = {
	categoriesService: CategoriesServiceInterface;
};

export function createCategoryModule(database: Database): CategoryModule {
	const repository = new DrizzleCategoryRepository(database);
	const categoriesService = new CategoriesService(repository);

	return {
		categoriesService,
	};
}
