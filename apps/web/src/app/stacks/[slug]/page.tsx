import { services } from "@missingstack/api/context";
import type { StackWithCount, Tag } from "@missingstack/api/types";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Footer } from "~/components/home/footer";
import { Header } from "~/components/home/header";
import { ToolCardSkeleton } from "~/components/home/tool-card";
import { StackContent } from "~/components/stacks/stack-content";
import { StructuredData } from "~/components/structured-data";
import { Badge } from "~/components/ui/badge";
import { Container } from "~/components/ui/container";
import { Skeleton } from "~/components/ui/skeleton";
import { getIcon } from "~/lib/icons";
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

	const StackIcon = stack.icon ? getIcon(stack.icon) : null;

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
			<Container className="mb-4 sm:mb-6">
				<nav className="flex flex-wrap items-center gap-1.5 text-muted-foreground text-xs sm:gap-2 sm:text-sm">
					<Link
						href="/"
						className="transition-colors duration-200 hover:text-primary"
					>
						Home
					</Link>
					<ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
					<Link
						href="/stacks"
						className="transition-colors duration-200 hover:text-primary"
					>
						Stacks
					</Link>
					<ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
					<span className="font-medium text-primary">{stack.name}</span>
				</nav>
			</Container>

			<Container className="mb-8 sm:mb-12">
				<div className="flex flex-col justify-between gap-4 sm:gap-6 lg:flex-row lg:items-end">
					<div className="flex items-start gap-3 sm:gap-4 lg:gap-5">
						{StackIcon && (
							<div className="rounded-xl bg-secondary/80 p-3 transition-transform duration-200 hover:scale-105 sm:rounded-2xl sm:p-4">
								<StackIcon className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
							</div>
						)}
						<div className="min-w-0 flex-1">
							<h1 className="mb-2 text-2xl text-primary leading-tight sm:mb-3 sm:text-3xl md:text-4xl lg:text-5xl">
								{stack.name} Tools
							</h1>
							<p className="max-w-2xl text-muted-foreground text-sm sm:text-base lg:text-lg">
								Browse our{" "}
								<Link
									href="/"
									className="font-medium text-primary underline transition-colors hover:text-primary/80"
								>
									curated directory
								</Link>{" "}
								to discover the best {stack.name.toLowerCase()} tools.{" "}
								{stack.description ||
									`Find ${stack.name.toLowerCase()} tools for your stack.`}
							</p>
							<div className="mt-3 flex flex-wrap items-center gap-3 sm:mt-4 sm:gap-4">
								<Badge variant="secondary" className="text-xs sm:text-sm">
									{stack.toolCount} tools
								</Badge>
								{stackCategories.length > 0 && (
									<Badge variant="secondary" className="text-xs sm:text-sm">
										{stackCategories.length} categor
										{stackCategories.length === 1 ? "y" : "ies"}
									</Badge>
								)}
								{stack.updatedAt && (
									<time
										dateTime={stack.updatedAt.toISOString()}
										className="text-muted-foreground text-xs sm:text-sm"
									>
										Updated{" "}
										{stack.updatedAt.toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</time>
								)}
							</div>
						</div>
					</div>
				</div>
			</Container>

			<Suspense
				fallback={
					<Container>
						<div className="flex flex-col gap-6 sm:gap-8 lg:flex-row">
							<aside className="w-full shrink-0 lg:w-64">
								<div className="space-y-4">
									<Skeleton className="h-48 rounded-xl sm:h-64" />
									<Skeleton className="h-40 rounded-xl sm:h-48" />
								</div>
							</aside>
							<div className="flex-1">
								<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
									{Array.from({ length: 6 }).map((_, i) => (
										<ToolCardSkeleton key={`skeleton-${i.toString()}`} />
									))}
								</div>
							</div>
						</div>
					</Container>
				}
			>
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

/**
 * Page loading skeleton
 */
function StackPageSkeleton() {
	return (
		<>
			<Container className="mb-6">
				<Skeleton className="h-5 w-48" />
			</Container>
			<Container className="mb-12">
				<div className="flex items-start gap-5">
					<Skeleton className="h-18 w-18 rounded-2xl" />
					<div className="flex-1">
						<Skeleton className="mb-3 h-12 w-64" />
						<Skeleton className="mb-4 h-6 w-96" />
						<Skeleton className="h-6 w-32" />
					</div>
				</div>
			</Container>
			<Container>
				<div className="flex flex-col gap-8 lg:flex-row">
					<aside className="w-full shrink-0 lg:w-64">
						<div className="space-y-4">
							<Skeleton className="h-64 rounded-xl" />
							<Skeleton className="h-48 rounded-xl" />
						</div>
					</aside>
					<div className="flex-1">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							{Array.from({ length: 6 }).map((_, i) => (
								<ToolCardSkeleton key={`skeleton-${i.toString()}`} />
							))}
						</div>
					</div>
				</div>
			</Container>
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
