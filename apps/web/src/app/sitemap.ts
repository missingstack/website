import { services } from "@missingstack/api/context";
import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { config } from "~/lib/site-config";

async function getAllCategories() {
	"use cache";
	cacheLife("days");
	cacheTag("categories");

	try {
		return await services.categoryService.getAllWithCounts();
	} catch (error) {
		console.error("Error fetching categories for sitemap:", error);
		return [];
	}
}

async function getAllTools() {
	"use cache";
	cacheLife("days");
	cacheTag("tools");

	try {
		// Fetch all tools - adjust limit based on your needs
		return await services.toolService.getAll({ limit: 10000 });
	} catch (error) {
		console.error("Error fetching tools for sitemap:", error);
		return { items: [] };
	}
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = config.url;
	const now = new Date();

	// Static pages with high priority
	const staticPages: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: now,
			changeFrequency: "daily",
			priority: 1.0,
		},
		{
			url: `${baseUrl}/categories`,
			lastModified: now,
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/discover`,
			lastModified: now,
			changeFrequency: "hourly",
			priority: 0.9,
		},
	];

	// Fetch dynamic content
	const [categories, toolsResult] = await Promise.all([
		getAllCategories(),
		getAllTools(),
	]);

	// Category pages - medium-high priority
	const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
		url: `${baseUrl}/categories/${category.slug}`,
		lastModified: now,
		changeFrequency: "daily" as const,
		priority: 0.8,
	}));

	// Tool pages - medium priority
	const toolPages: MetadataRoute.Sitemap = toolsResult.items.map((tool) => ({
		url: `${baseUrl}/tools/${tool.slug}`,
		lastModified: now,
		changeFrequency: "weekly" as const,
		priority: 0.7,
	}));

	// Combine all pages
	const allPages = [...staticPages, ...categoryPages, ...toolPages];

	// Log sitemap stats (helpful for debugging)
	if (process.env.NODE_ENV === "development") {
		console.log(`Sitemap generated with ${allPages.length} URLs:`, {
			static: staticPages.length,
			categories: categoryPages.length,
			tools: toolPages.length,
		});
	}

	return allPages;
}
