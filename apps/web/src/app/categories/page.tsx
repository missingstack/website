import { services } from "@missingstack/api/context";
import type { ToolData } from "@missingstack/api/types";
import { ArrowRight, TrendingUp } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { CategoriesContent } from "~/components/categories/categories-content";
import { StickyCategoryNav } from "~/components/categories/sticky-category-nav";
import { Footer } from "~/components/home/footer";
import { Header } from "~/components/home/header";
import { Badge } from "~/components/ui/badge";
import { Container } from "~/components/ui/container";

async function getCategoriesWithCounts() {
	"use cache";
	cacheLife("days");
	cacheTag("categories");

	return services.categoryService.getAllWithCounts();
}

async function getStats() {
	"use cache";
	cacheLife("days");
	cacheTag("stats");

	return services.statsService.getStats();
}

async function getToolsByCategory(categoryId: string, pageSize: number) {
	"use cache";
	cacheLife("days");
	cacheTag("tools", `category-${categoryId}`);

	return services.toolService.getByCategory(categoryId, { limit: pageSize });
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

	// Group tools by category for previews
	const categoryToolPreviews = await Promise.all(
		topCategories.map(async (cat) => {
			const result = await getToolsByCategory(cat.id, 3);
			return { category: cat, tools: result.items as ToolData[] };
		}),
	);

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Header />
			<StickyCategoryNav categories={categories} />

			<main className="flex-1 py-12">
				<Container className="mb-16">
					<div className="mx-auto mb-12 max-w-3xl text-center">
						<Badge variant="blue" className="mb-4">
							<TrendingUp className="h-3 w-3" />
							{stats.totalCategories} Categories
						</Badge>
						<h1 className="mb-4 font-serif text-4xl text-primary md:text-6xl">
							Browse by Category
						</h1>
						<p className="text-lg text-muted-foreground">
							Discover the perfect tools organized by what you need. From AI to
							design, development to marketing.
						</p>
					</div>
				</Container>

				<CategoriesContent
					categories={categories}
					categoryToolPreviews={categoryToolPreviews}
				/>

				<Container className="mt-20">
					<div className="rounded-3xl bg-primary p-12 text-center text-white">
						<h2 className="mb-4 font-serif text-3xl md:text-4xl">
							Can't find what you're looking for?
						</h2>
						<p className="mx-auto mb-8 max-w-xl text-white/70">
							Contribute a Tool you love and help fellow builders discover it.
						</p>
						<Link
							href="/submit"
							className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-medium text-primary transition-colors hover:bg-white/90"
						>
							Contribute a Tool
							<ArrowRight className="h-4 w-4" />
						</Link>
					</div>
				</Container>
			</main>

			<Footer />
		</div>
	);
}
