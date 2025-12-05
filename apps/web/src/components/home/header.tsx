import { services } from "@missingstack/api/context";
import { cacheLife } from "next/cache";
import { HeaderContent } from "./header-content";

export async function getCategoriesWithCounts() {
	"use cache";
	cacheLife("days");

	const data = await services.categoryService.getAllWithCounts();
	return data || [];
}

export async function getStats() {
	"use cache";
	cacheLife("days");

	return await services.statsService.getStats();
}

export async function Header() {
	const categories = await getCategoriesWithCounts();
	const stats = await getStats();

	const topCategories = categories.filter((c) => c.toolCount > 0).slice(0, 6);
	return (
		<HeaderContent
			categories={categories}
			stats={stats}
			topCategories={topCategories}
		/>
	);
}
