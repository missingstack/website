import type { CategoryWithCount, Tag } from "@missingstack/api/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryBreadcrumb } from "~/components/categories/category-breadcrumb";
import { CategoryContent } from "~/components/categories/category-content";
import { CategoryContentSkeleton } from "~/components/categories/category-content-skeleton";
import { CategoryHeader } from "~/components/categories/category-header";
import { CategoryPageSkeleton } from "~/components/categories/category-page-skeleton";
import { Footer } from "~/components/home/footer";
import { Header } from "~/components/home/header";
import { StructuredData } from "~/components/structured-data";
import {
	getAllCategories,
	getCategoriesData,
	getToolsByCategory,
} from "~/lib/categories/data";
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
			<CategoryBreadcrumb
				items={[
					{ name: "Home", href: "/" },
					{ name: "Categories", href: "/categories" },
				]}
				currentPage={category.name}
			/>
			<CategoryHeader category={category} />

			<Suspense fallback={<CategoryContentSkeleton />}>
				<CategoryContent
					category={category}
					relatedCategories={relatedCategories}
					tags={tags}
				/>
			</Suspense>
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

export async function generateStaticParams() {
	try {
		const categories = await getAllCategories();
		const params = categories.map((cat) => ({
			slug: cat.slug,
		}));

		if (params.length === 0) {
			// Next.js Cache Components requires at least one result
			// Return a placeholder if no categories exist
			return [{ slug: "base" }];
		}

		return params;
	} catch (error) {
		console.error("Error generating static params for categories:", error);
		return [{ slug: "base" }];
	}
}
