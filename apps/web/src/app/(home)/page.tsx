import { services } from "@missingstack/api/context";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";
import { CTASection } from "~/components/home/cta";
import { Footer } from "~/components/home/footer";
import { Header } from "~/components/home/header";
import { HeroSection } from "~/components/home/hero";
import { NewsletterSection } from "~/components/home/newsletter";
import { HomepageSections } from "~/components/home/sections/homepage-sections";
import { HomepageSectionsSkeleton } from "~/components/home/sections/homepage-sections-skeleton";
import { StructuredData } from "~/components/structured-data";
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
		title: "Discover tools to build what's next",
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
				<Suspense fallback={<HomepageSectionsSkeleton />}>
					<HomepageSections />
				</Suspense>
				<NewsletterSection />
				<CTASection />
			</main>
			<Footer />
		</div>
	);
}
