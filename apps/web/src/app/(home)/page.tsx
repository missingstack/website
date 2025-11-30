import { services } from "@missingstack/api/context";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";
import { CTASection } from "~/components/home/cta-section";
import { Footer } from "~/components/home/footer";
import { Header } from "~/components/home/header";
import { HeroSection } from "~/components/home/hero-section";
import { HomepageSections } from "~/components/home/homepage-sections";
import { NewsletterSection } from "~/components/home/newsletter-section";
import { ToolCardSkeleton } from "~/components/home/tool-card";
import { StructuredData } from "~/components/structured-data";
import { Container } from "~/components/ui/container";
import { Skeleton } from "~/components/ui/skeleton";
import {
	breadcrumb,
	generateSEOMetadata,
	itemList,
	organization,
	website,
} from "~/lib/seo";

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
		title: "A curated directory of awesome tools",
		description: `Discover ${stats.totalTools}+ curated tools across ${stats.totalCategories} categories. Build your modern product stack with the best AI tools, SaaS tools, and developer tools. Updated daily.`,
		url: "/",
	});
}

export default async function Home() {
	const [featuredTools, stats] = await Promise.all([
		getFeaturedTools(),
		getStats(),
	]);

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<StructuredData data={website()} />
			<StructuredData data={organization()} />
			<StructuredData data={breadcrumb([{ name: "Home", url: "/" }])} />
			<StructuredData
				data={itemList({
					name: "Featured Tools",
					description: `Discover ${stats.totalTools}+ curated tools. Featured tools hand-picked by our team.`,
					items: featuredTools.slice(0, 12).map((tool) => ({
						name: tool.name,
						url: `/tools/${tool.slug}`,
					})),
				})}
			/>
			<Header />
			<HeroSection />
			<main className="flex-1">
				{/* Cached content: Homepage sections - included in static shell
            Wrapped in Suspense for progressive enhancement and error boundaries
            Component has "use cache" with cacheLife("days") */}
				<Suspense
					fallback={
						<div className="bg-secondary/10">
							<Container className="py-8 sm:py-12 lg:py-16">
								<div className="space-y-8 sm:space-y-12 lg:space-y-16">
									{[1, 2, 3].map((sectionIndex) => (
										<div
											key={`section-skeleton-${sectionIndex}`}
											className="space-y-4 sm:space-y-6"
										>
											<Skeleton className="h-7 w-48 sm:h-8 sm:w-64" />
											<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
												{Array.from({ length: 3 }, (_, toolIndex) => {
													return (
														<ToolCardSkeleton
															key={`skeleton-${sectionIndex * 10 + toolIndex}`}
														/>
													);
												})}
											</div>
										</div>
									))}
								</div>
							</Container>
						</div>
					}
				>
					<HomepageSections />
				</Suspense>
				<NewsletterSection />
				<CTASection />
			</main>
			<Footer />
		</div>
	);
}
