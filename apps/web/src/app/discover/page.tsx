import { services } from "@missingstack/api/context";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";
import { DiscoverContent } from "~/components/discover/discover-content";
import { Footer } from "~/components/home/footer";
import { Header } from "~/components/home/header";
import { ToolCardSkeleton } from "~/components/home/tool-card";
import { Container } from "~/components/ui/container";
import { Skeleton } from "~/components/ui/skeleton";
import { PLATFORM_OPTIONS, PRICING_OPTIONS } from "~/lib/search-params";

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

export default async function DiscoverPage() {
	// Fetch static data that doesn't depend on search params
	const [categories, tags, stats] = await Promise.all([
		getCategoriesWithCounts(),
		getTags(),
		getStats(),
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
			<Header />

			<main className="flex-1 py-8 sm:py-12">
				<Container className="mb-8 sm:mb-12">
					<div className="flex flex-col justify-between gap-4 sm:gap-6 lg:flex-row lg:items-end">
						<div>
							<h1 className="mb-2 font-serif text-3xl text-primary leading-tight sm:mb-3 sm:text-4xl md:text-5xl">
								Discover Tools
							</h1>
							<p className="max-w-2xl text-muted-foreground text-sm sm:text-base lg:text-lg">
								Explore {stats.totalTools}+ curated tools across{" "}
								{stats.totalCategories} categories.
							</p>
						</div>
					</div>
				</Container>

				<Suspense
					fallback={
						<Container>
							<div className="flex flex-col gap-6 sm:gap-8 lg:flex-row">
								<aside className="hidden w-72 shrink-0 lg:block">
									<div className="space-y-4">
										<Skeleton className="h-48 rounded-xl sm:h-64" />
										<Skeleton className="h-40 rounded-xl sm:h-48" />
									</div>
								</aside>
								<div className="flex-1">
									<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
										{Array.from({ length: 6 }).map((_, i) => (
											<ToolCardSkeleton key={`skeleton-${i.toString()}`} />
										))}
									</div>
								</div>
							</div>
						</Container>
					}
				>
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
