import { services } from "@missingstack/api/context";
import type { Section, Tool, ToolData } from "@missingstack/api/types";
import { cacheLife, cacheTag } from "next/cache";
import { ConfigurableSection } from "./configurable-section";

async function getSections() {
	"use cache";
	cacheLife("days");
	cacheTag("sections");
	cacheTag("homepage-sections");

	return services.sectionService.getEnabled();
}

async function getPopularTools(limit: number) {
	"use cache";
	cacheLife("days");
	cacheTag("tools");
	cacheTag("popular-tools");
	cacheTag("homepage-tools");

	return services.toolService.getPopular(limit);
}

async function getRecentTools(limit: number) {
	"use cache";
	cacheLife("days");
	cacheTag("tools");
	cacheTag("recent-tools");
	cacheTag("homepage-tools");

	return services.toolService.getRecent(limit);
}

async function getFeaturedTools(limit: number) {
	"use cache";
	cacheLife("days");
	cacheTag("tools");
	cacheTag("featured-tools");
	cacheTag("homepage-tools");

	return services.toolService.getFeatured(limit);
}

async function getToolsByCategory(categorySlug: string, limit: number) {
	"use cache";
	cacheLife("days");
	cacheTag("tools");
	cacheTag(`category-${categorySlug}`);
	cacheTag("homepage-tools");

	const category = await services.categoryService.getBySlug(categorySlug);
	if (!category) {
		return [];
	}

	const result = await services.toolService.getByCategory(category.id, {
		limit: limit,
		sortBy: "newest",
		includeRelations: false,
	});
	return result.items;
}

async function getToolsForSection(
	config: Section,
): Promise<ToolData[] | Tool[]> {
	if (config.type === "filter") {
		if (config.filter === "popular") {
			return getPopularTools(config.limit ?? 6);
		}
		if (config.filter === "newest") {
			return getRecentTools(config.limit ?? 4);
		}
		return getFeaturedTools(config.limit ?? 6);
	}

	if (config.type === "category" && config.categoryId) {
		return getToolsByCategory(config.categoryId, config.limit ?? 6);
	}

	return [];
}

export async function HomepageSections() {
	const sections = await getSections();
	if (sections.length === 0) return null;

	const toolsPerSection = await Promise.all(
		sections.map((section) => getToolsForSection(section)),
	);

	const sectionsWithTools = sections.map((section, index) => ({
		section,
		tools: toolsPerSection[index],
	}));

	return (
		<div className="bg-secondary/10">
			{sectionsWithTools.map(({ section, tools }) => (
				<ConfigurableSection key={section.id} config={section} tools={tools} />
			))}
		</div>
	);
}
