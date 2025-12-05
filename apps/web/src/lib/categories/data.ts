import { services } from "@missingstack/api/context";
import { cacheLife, cacheTag } from "next/cache";

export async function getCategoriesData() {
	"use cache";
	cacheLife("days");

	const [allCategories, allTags] = await Promise.all([
		services.categoryService.getAllWithCounts(),
		services.tagService.getAll(),
	]);

	return { allCategories, allTags };
}

export async function getCategoriesWithCounts() {
	"use cache";
	cacheLife("days");
	cacheTag("categories");

	return services.categoryService.getAllWithCounts();
}

export async function getStats() {
	"use cache";
	cacheLife("days");
	cacheTag("stats");

	return services.statsService.getStats();
}

export async function getToolsByCategory(categoryId: string, pageSize: number) {
	"use cache";
	cacheLife("days");
	cacheTag("tools", `category-${categoryId}`);

	return services.toolService.getByCategory(categoryId, { limit: pageSize });
}

export async function getAllCategories() {
	"use cache";
	cacheLife("days");
	cacheTag("categories");

	return services.categoryService.getAllWithCounts();
}
