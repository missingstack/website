import { services } from "@missingstack/api/context";
import type { ToolData } from "@missingstack/api/types";
import { ArrowRight, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { Footer } from "~/components/home/footer";
import { Header } from "~/components/home/header";
import { StacksContent } from "~/components/stacks/stacks-content";
import { StructuredData } from "~/components/structured-data";
import { Badge } from "~/components/ui/badge";
import { Container } from "~/components/ui/container";
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
				<Container className="mb-12 sm:mb-16">
					<div className="mx-auto mb-8 max-w-3xl text-center sm:mb-12">
						<Badge
							variant="blue"
							className="mb-3 transition-all duration-200 hover:scale-105 sm:mb-4"
						>
							<TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
							<span className="text-xs sm:text-sm">{stacks.length} Stacks</span>
						</Badge>
						<h1 className="mb-3 text-3xl text-primary leading-tight sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
							Browse Tools by Technology Stack
						</h1>
						<p className="px-4 text-base text-muted-foreground sm:px-0 sm:text-lg">
							Browse our{" "}
							<Link
								href="/"
								className="font-medium text-primary underline transition-colors hover:text-primary/80"
							>
								curated directory
							</Link>{" "}
							by technology stack. Discover the perfect tools organized by what
							you need. Popular stacks: {topStackNames.join(", ")}, and{" "}
							{remainingCount} more.
						</p>
					</div>
				</Container>

				<StacksContent stacks={stacks} stackToolPreviews={stackToolPreviews} />

				<Container className="mt-12 sm:mt-16 lg:mt-20">
					<div className="rounded-2xl bg-primary p-8 text-center text-white transition-all duration-300 hover:shadow-primary/20 hover:shadow-xl sm:rounded-3xl sm:p-10 lg:p-12">
						<h2 className="mb-3 text-2xl sm:mb-4 sm:text-3xl md:text-4xl">
							Can't find what you're looking for?
						</h2>
						<p className="mx-auto mb-6 max-w-xl text-sm text-white/70 sm:mb-8 sm:text-base">
							Contribute a Tool you love and help fellow builders discover it.
						</p>
						<Link
							href="/submit"
							rel="nofollow"
							className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-6 py-2.5 font-medium text-primary transition-all duration-300 hover:scale-105 hover:bg-white/90 active:scale-95 sm:px-8 sm:py-3"
						>
							Contribute a Tool
							<ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 sm:h-4 sm:w-4" />
						</Link>
					</div>
				</Container>
			</main>

			<Footer />
		</div>
	);
}
