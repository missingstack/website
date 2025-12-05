import { services } from "@missingstack/api/context";
import type { ToolData } from "@missingstack/api/types";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Footer } from "~/components/home/footer";
import { Header } from "~/components/home/header";
import { StacksContent } from "~/components/stacks/stacks-content";
import { StacksCTA } from "~/components/stacks/stacks-cta";
import { StacksHero } from "~/components/stacks/stacks-hero";
import { StructuredData } from "~/components/structured-data";
import { breadcrumb, generateSEOMetadata, itemList } from "~/lib/seo";

async function getStacksWithCounts() {
	"use cache";
	cacheLife("days");
	cacheTag("stacks");

	return services.stackService.getAllWithCounts();
}

async function getStats() {
	"use cache";
	cacheLife("days");
	cacheTag("stats");

	return services.statsService.getStats();
}

async function getToolsByStack(stackId: string, pageSize: number) {
	"use cache";
	cacheLife("days");
	cacheTag("tools", `stack-${stackId}`);

	return services.toolService.getByStack(stackId, { limit: pageSize });
}

export async function generateMetadata(): Promise<Metadata> {
	const stats = await getStats();

	return generateSEOMetadata({
		title: `Browse ${stats.totalStacks} Technology Stacks`,
		description: `Explore ${stats.totalStacks} technology stacks for developers, builders, and entrepreneurs. Find the perfect tools organized by stack - from MERN to JAMstack, and more.`,
		url: "/stacks",
	});
}

export default async function StacksPage() {
	const stacks = await getStacksWithCounts();

	// Get top 4 stacks with most tools for featured section
	const topStacks = [...stacks]
		.sort((a, b) => b.toolCount - a.toolCount)
		.slice(0, 4);

	// Get top 3-4 stack names for H1 keyword optimization
	const topStackNames = topStacks.slice(0, 4).map((stack) => stack.name);
	const remainingCount = stacks.length - topStackNames.length;

	// Group tools by stack for previews
	const stackToolPreviews = await Promise.all(
		topStacks.map(async (stack) => {
			const result = await getToolsByStack(stack.id, 3);
			return { stack, tools: result.items as ToolData[] };
		}),
	);

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<StructuredData
				data={breadcrumb([
					{ name: "Home", url: "/" },
					{ name: "Stacks", url: "/stacks" },
				])}
			/>
			<StructuredData
				data={itemList({
					name: "Technology Stacks",
					description: `Browse tools organized by technology stack. Explore ${stacks.length} stacks with curated tools.`,
					items: stacks.map((stack) => ({
						name: stack.name,
						url: `/stacks/${stack.slug}`,
					})),
				})}
			/>
			<Header />

			<main className="flex-1 py-8 sm:py-12">
				<StacksHero
					totalStacks={stacks.length}
					topStackNames={topStackNames}
					remainingCount={remainingCount}
				/>

				<StacksContent stacks={stacks} stackToolPreviews={stackToolPreviews} />

				<StacksCTA />
			</main>

			<Footer />
		</div>
	);
}
