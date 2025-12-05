import type { ToolData } from "@missingstack/api/types";
import type { Metadata } from "next";
import { CategoriesContent } from "~/components/categories/categories-content";
import { CategoriesCTA } from "~/components/categories/categories-cta";
import { CategoriesHero } from "~/components/categories/categories-hero";
import { Footer } from "~/components/home/footer";
import { Header } from "~/components/home/header";
import { StructuredData } from "~/components/structured-data";
import {
	getCategoriesWithCounts,
	getStats,
	getToolsByCategory,
} from "~/lib/categories/data";
import { breadcrumb, generateSEOMetadata, itemList } from "~/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
	const stats = await getStats();

	return generateSEOMetadata({
		title: `Browse ${stats.totalCategories} Tool Categories`,
		description: `Explore ${stats.totalCategories} categories of tools for developers, builders, and entrepreneurs. Find the perfect tools organized by category - from AI to design, development to marketing.`,
		url: "/categories",
	});
}

export default async function CategoriesPage() {
	const [categories, stats] = await Promise.all([
		getCategoriesWithCounts(),
		getStats(),
	]);

	// Get top 4 categories with most tools for featured section
	const topCategories = [...categories]
		.sort((a, b) => b.toolCount - a.toolCount)
		.slice(0, 4);

	// Get top 3-4 category names for H1 keyword optimization
	const topCategoryNames = topCategories.slice(0, 4).map((cat) => cat.name);
	const remainingCount = categories.length - topCategoryNames.length;

	// Group tools by category for previews
	const categoryToolPreviews = await Promise.all(
		topCategories.map(async (cat) => {
			const result = await getToolsByCategory(cat.id, 3);
			return { category: cat, tools: result.items as ToolData[] };
		}),
	);

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<StructuredData
				data={breadcrumb([
					{ name: "Home", url: "/" },
					{ name: "Categories", url: "/categories" },
				])}
			/>
			<StructuredData
				data={itemList({
					name: "Tool Categories",
					description: `Browse tools organized by category. Explore ${stats.totalCategories} categories with ${stats.totalTools}+ curated tools.`,
					items: categories.map((cat) => ({
						name: cat.name,
						url: `/categories/${cat.slug}`,
					})),
				})}
			/>
			<Header />

			<main className="flex-1 py-8 sm:py-12">
				<CategoriesHero
					totalCategories={stats.totalCategories}
					topCategoryNames={topCategoryNames}
					remainingCount={remainingCount}
				/>

				<CategoriesContent
					categories={categories}
					categoryToolPreviews={categoryToolPreviews}
				/>

				<CategoriesCTA />
			</main>

			<Footer />
		</div>
	);
}
