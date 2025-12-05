import { services } from "@missingstack/api/context";
import type { StackWithCount, Tag } from "@missingstack/api/types";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Footer } from "~/components/home/footer";
import { Header } from "~/components/home/header";
import { StackBreadcrumb } from "~/components/stacks/stack-breadcrumb";
import { StackContent } from "~/components/stacks/stack-content";
import { StackContentSkeleton } from "~/components/stacks/stack-content-skeleton";
import { StackHeader } from "~/components/stacks/stack-header";
import { StackPageSkeleton } from "~/components/stacks/stack-page-skeleton";
import { StructuredData } from "~/components/structured-data";
import { breadcrumb, generateSEOMetadata, itemList } from "~/lib/seo";

interface StackPageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({
	params,
}: StackPageProps): Promise<Metadata> {
	const { slug } = await params;
	const { allStacks } = await getStacksData();

	const stack = allStacks.find((s) => s.slug === slug);

	if (!stack) {
		return generateSEOMetadata({
			title: "Stack Not Found",
			description: "The requested stack could not be found.",
			noindex: true,
		});
	}

	return generateSEOMetadata({
		title: `${stack.name} Tools`,
		description:
			stack.description ||
			`Discover the best ${stack.name.toLowerCase()} tools. Browse ${stack.toolCount} curated ${stack.name.toLowerCase()} tools for developers, builders, and entrepreneurs.`,
		url: `/stacks/${slug}`,
	});
}

async function getStacksData() {
	"use cache";
	cacheLife("days");

	const [allStacks, allTags] = await Promise.all([
		services.stackService.getAllWithCounts(),
		services.tagService.getAll(),
	]);

	return { allStacks, allTags };
}

async function getToolsByStack(stackId: string, pageSize: number) {
	"use cache";
	cacheLife("days");
	cacheTag("tools", `stack-${stackId}`);

	return services.toolService.getByStack(stackId, { limit: pageSize });
}

async function getCategoriesByStack(stackId: string) {
	"use cache";
	cacheLife("days");
	cacheTag("categories", `stack-${stackId}`);

	return services.categoryService.getByStack(stackId);
}

/**
 * Server component that handles the dynamic stack lookup
 * This component receives the params promise and awaits it inside Suspense
 */
async function StackPageContent({
	paramsPromise,
	allStacks,
	tags,
}: {
	paramsPromise: Promise<{ slug: string }>;
	allStacks: StackWithCount[];
	tags: Tag[];
}) {
	const { slug } = await paramsPromise;

	// Find stack with count from allStacks
	const stack = allStacks.find((s) => s.slug === slug);

	if (!stack) {
		notFound();
	}

	// Get tools for ItemList schema
	const toolsResult = await getToolsByStack(stack.id, 12);
	const stackTools = toolsResult.items;

	// Get categories for this stack
	const stackCategories = await getCategoriesByStack(stack.id);

	// Related stacks (exclude current)
	const relatedStacks = allStacks
		.filter((s) => s.id !== stack.id && s.toolCount > 0)
		.slice(0, 4);

	return (
		<>
			<StructuredData
				data={breadcrumb([
					{ name: "Home", url: "/" },
					{ name: "Stacks", url: "/stacks" },
					{ name: stack.name, url: `/stacks/${stack.slug}` },
				])}
			/>
			<StructuredData
				data={itemList({
					name: `${stack.name} Tools`,
					description: `Browse ${stack.toolCount} curated ${stack.name.toLowerCase()} tools for developers, builders, and entrepreneurs.`,
					items: stackTools.slice(0, 12).map((tool) => ({
						name: tool.name,
						url: `/tools/${tool.slug}`,
					})),
				})}
			/>
			<StackBreadcrumb
				items={[
					{ name: "Home", href: "/" },
					{ name: "Stacks", href: "/stacks" },
				]}
				currentPage={stack.name}
			/>
			<StackHeader stack={stack} categories={stackCategories} />

			<Suspense fallback={<StackContentSkeleton />}>
				<StackContent
					stack={stack}
					relatedStacks={relatedStacks}
					stackCategories={stackCategories}
					tags={tags}
				/>
			</Suspense>
		</>
	);
}

export default async function StackPage({ params }: StackPageProps) {
	const { slug } = await params;
	const { allStacks } = await getStacksData();
	const stack = allStacks.find((s) => s.slug === slug);

	if (!stack) {
		notFound();
	}

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Header />

			<main className="flex-1 py-6 sm:py-8">
				<Suspense fallback={<StackPageSkeleton />}>
					<StackPageWrapper paramsPromise={params} />
				</Suspense>
			</main>

			<Footer />
		</div>
	);
}

/**
 * Wrapper that fetches data and renders content
 * Data fetching happens in a component that doesn't receive params
 */
async function StackPageWrapper({
	paramsPromise,
}: {
	paramsPromise: Promise<{ slug: string }>;
}) {
	// Fetch data in a component that doesn't receive params
	// This ensures cached functions are called independently
	const { allStacks, allTags } = await getStacksData();

	return (
		<StackPageContent
			paramsPromise={paramsPromise}
			allStacks={allStacks}
			tags={allTags}
		/>
	);
}

async function getAllStacks() {
	"use cache";
	cacheLife("days");
	cacheTag("stacks");

	return services.stackService.getAllWithCounts();
}

export async function generateStaticParams() {
	try {
		const stacks = await getAllStacks();
		const params = stacks.map((stack) => ({
			slug: stack.slug,
		}));

		if (params.length === 0) {
			// Next.js Cache Components requires at least one result
			// Return a placeholder if no stacks exist
			return [{ slug: "base" }];
		}

		return params;
	} catch (error) {
		console.error("Error generating static params for stacks:", error);
		return [{ slug: "base" }];
	}
}
