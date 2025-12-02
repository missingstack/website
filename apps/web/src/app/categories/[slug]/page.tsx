import { services } from "@missingstack/api/context";
import type { CategoryWithCount, Tag } from "@missingstack/api/types";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryContent } from "~/components/categories/category-content";
import { Footer } from "~/components/home/footer";
import { Header } from "~/components/home/header";
import { ToolCardSkeleton } from "~/components/home/tool-card";
import { StructuredData } from "~/components/structured-data";
import { Badge } from "~/components/ui/badge";
import { Container } from "~/components/ui/container";
import { Skeleton } from "~/components/ui/skeleton";
import { getIcon } from "~/lib/icons";
import { breadcrumb, generateSEOMetadata, itemList } from "~/lib/seo";

interface CategoryPageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({
	params,
}: CategoryPageProps): Promise<Metadata> {
	const { slug } = await params;
	const { allCategories } = await getCategoriesData();

	const category = allCategories.find((c) => c.slug === slug);

	if (!category) {
		return generateSEOMetadata({
			title: "Category Not Found",
			description: "The requested category could not be found.",
			noindex: true,
		});
	}

	return generateSEOMetadata({
		title: `${category.name} Tools`,
		description:
			category.description ||
			`Discover the best ${category.name.toLowerCase()} tools. Browse ${category.toolCount} curated ${category.name.toLowerCase()} tools for developers, builders, and entrepreneurs.`,
		url: `/categories/${slug}`,
	});
}

async function getCategoriesData() {
	"use cache";
	cacheLife("days");

	const [allCategories, allTags] = await Promise.all([
		services.categoryService.getAllWithCounts(),
		services.tagService.getAll(),
	]);

	return { allCategories, allTags };
}

async function getToolsByCategory(categoryId: string, pageSize: number) {
	"use cache";
	cacheLife("days");
	cacheTag("tools", `category-${categoryId}`);

	return services.toolService.getByCategory(categoryId, { limit: pageSize });
}

/**
 * Server component that handles the dynamic category lookup
 * This component receives the params promise and awaits it inside Suspense
 */
async function CategoryPageContent({
	paramsPromise,
	allCategories,
	tags,
}: {
	paramsPromise: Promise<{ slug: string }>;
	allCategories: CategoryWithCount[];
	tags: Tag[];
}) {
	const { slug } = await paramsPromise;

	// Find category with count from allCategories
	const category = allCategories.find((c) => c.slug === slug);

	if (!category) {
		notFound();
	}

	// Get tools for ItemList schema
	const toolsResult = await getToolsByCategory(category.id, 12);
	const categoryTools = toolsResult.items;

	// Related categories (exclude current)
	const relatedCategories = allCategories
		.filter((c) => c.id !== category.id && c.toolCount > 0)
		.slice(0, 4);

	const CategoryIcon = getIcon(category.icon);

	return (
		<>
			<StructuredData
				data={breadcrumb([
					{ name: "Home", url: "/" },
					{ name: "Categories", url: "/categories" },
					{ name: category.name, url: `/categories/${category.slug}` },
				])}
			/>
			<StructuredData
				data={itemList({
					name: `${category.name} Tools`,
					description: `Browse ${category.toolCount} curated ${category.name.toLowerCase()} tools for developers, builders, and entrepreneurs.`,
					items: categoryTools.slice(0, 12).map((tool) => ({
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
						href="/categories"
						className="transition-colors duration-200 hover:text-primary"
					>
						Categories
					</Link>
					<ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
					<span className="font-medium text-primary">{category.name}</span>
				</nav>
			</Container>

			<Container className="mb-8 sm:mb-12">
				<div className="flex flex-col justify-between gap-4 sm:gap-6 lg:flex-row lg:items-end">
					<div className="flex items-start gap-3 sm:gap-4 lg:gap-5">
						<div className="rounded-xl bg-secondary/80 p-3 transition-transform duration-200 hover:scale-105 sm:rounded-2xl sm:p-4">
							<CategoryIcon className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
						</div>
						<div className="min-w-0 flex-1">
							<h1 className="mb-2 text-2xl text-primary leading-tight sm:mb-3 sm:text-3xl md:text-4xl lg:text-5xl">
								{category.name} Tools
							</h1>
							<p className="max-w-2xl text-muted-foreground text-sm sm:text-base lg:text-lg">
								Browse our{" "}
								<Link
									href="/"
									className="font-medium text-primary underline transition-colors hover:text-primary/80"
								>
									curated directory
								</Link>{" "}
								to discover the best {category.name.toLowerCase()} tools.{" "}
								{category.description ||
									`Find ${category.name.toLowerCase()} tools for your stack.`}
							</p>
							<div className="mt-3 flex flex-wrap items-center gap-3 sm:mt-4 sm:gap-4">
								<Badge variant="secondary" className="text-xs sm:text-sm">
									{category.toolCount} tools
								</Badge>
								{category.updatedAt && (
									<time
										dateTime={category.updatedAt.toISOString()}
										className="text-muted-foreground text-xs sm:text-sm"
									>
										Updated{" "}
										{category.updatedAt.toLocaleDateString("en-US", {
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
				<CategoryContent
					category={category}
					relatedCategories={relatedCategories}
					tags={tags}
				/>
			</Suspense>
		</>
	);
}

/**
 * Page loading skeleton
 */
function CategoryPageSkeleton() {
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

export default async function CategoryPage({ params }: CategoryPageProps) {
	const { slug } = await params;
	const { allCategories } = await getCategoriesData();
	const category = allCategories.find((c) => c.slug === slug);

	if (!category) {
		notFound();
	}

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Header />

			<main className="flex-1 py-6 sm:py-8">
				<Suspense fallback={<CategoryPageSkeleton />}>
					<CategoryPageWrapper paramsPromise={params} />
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
async function CategoryPageWrapper({
	paramsPromise,
}: {
	paramsPromise: Promise<{ slug: string }>;
}) {
	// Fetch data in a component that doesn't receive params
	// This ensures cached functions are called independently
	const { allCategories, allTags } = await getCategoriesData();

	return (
		<CategoryPageContent
			paramsPromise={paramsPromise}
			allCategories={allCategories}
			tags={allTags}
		/>
	);
}

async function getAllCategories() {
	"use cache";
	cacheLife("days");
	cacheTag("categories");

	return services.categoryService.getAll();
}

export async function generateStaticParams() {
	try {
		const categories = await getAllCategories();
		return categories.map((cat) => ({
			slug: cat.slug,
		}));
	} catch (error) {
		console.error("Error generating static params for categories:", error);
		// Return empty array on error to prevent build failure
		// Pages will be generated on-demand if static generation fails
		return [];
	}
}
