import { services } from "@missingstack/api/context";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";
import {
	DiscoverContent,
	DiscoverPageHeader,
	DiscoverPageSkeleton,
	DiscoverStructuredData,
} from "~/components/discover";
import { Footer } from "~/components/home/footer";
import { Header } from "~/components/home/header";
import { PLATFORM_OPTIONS, PRICING_OPTIONS } from "~/lib/search-params";
import { generateSEOMetadata } from "~/lib/seo";

async function getCategoriesWithCounts() {
	"use cache";
	cacheLife("days");
	cacheTag("categories");

	return services.categoryService.getAllWithCounts();
}

async function getTags() {
	"use cache";
	cacheLife("days");
	cacheTag("tags");

	return services.tagService.getAll();
}

async function getStats() {
	"use cache";
	cacheLife("days");
	cacheTag("stats");

	return services.statsService.getStats();
}

async function getFeaturedTools() {
	"use cache";
	cacheLife("days");
	cacheTag("tools");

	return services.toolService.getFeatured(12);
}

export async function generateMetadata(): Promise<Metadata> {
	const stats = await getStats();

	return generateSEOMetadata({
		title: "Discover Tools - Search & Filter",
		description: `Discover and search through ${stats.totalTools}+ curated tools across ${stats.totalCategories} categories. Filter by category, pricing, platform, and more to find the perfect tools for your needs.`,
		url: "/discover",
	});
}

export default async function DiscoverPage() {
	// Fetch static data that doesn't depend on search params
	const [categories, tags, stats, featuredTools] = await Promise.all([
		getCategoriesWithCounts(),
		getTags(),
		getStats(),
		getFeaturedTools(),
	]);

	// Create lookup maps for filter labels
	const categoryNames: Record<string, string> = {};
	for (const cat of categories) {
		categoryNames[cat.id] = cat.name;
	}

	const tagNames: Record<string, string> = {};
	for (const tag of tags) {
		tagNames[tag.id] = tag.name;
	}

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<DiscoverStructuredData
				featuredTools={featuredTools}
				totalTools={stats.totalTools}
			/>
			<Header />

			<main className="flex-1 py-8 sm:py-12">
				<DiscoverPageHeader
					totalTools={stats.totalTools}
					totalCategories={stats.totalCategories}
				/>

				<Suspense fallback={<DiscoverPageSkeleton />}>
					<DiscoverContent
						categories={categories}
						tags={tags}
						categoryNames={categoryNames}
						tagNames={tagNames}
						pricingOptions={PRICING_OPTIONS}
						platformOptions={PLATFORM_OPTIONS}
					/>
				</Suspense>
			</main>

			<Footer />
		</div>
	);
}
