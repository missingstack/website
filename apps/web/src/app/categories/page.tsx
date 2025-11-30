import { services } from "@missingstack/api/context";
import type { ToolData } from "@missingstack/api/types";
import { ArrowRight, TrendingUp } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { CategoriesContent } from "~/components/categories/categories-content";
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

			<main className="flex-1 py-8 sm:py-12">
				<Container className="mb-12 sm:mb-16">
					<div className="mx-auto mb-8 max-w-3xl text-center sm:mb-12">
						<Badge
							variant="blue"
							className="mb-3 transition-all duration-200 hover:scale-105 sm:mb-4"
						>
							<TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
							<span className="text-xs sm:text-sm">
								{stats.totalCategories} Categories
							</span>
						</Badge>
						<h1 className="mb-3 font-serif text-3xl text-primary leading-tight sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
							Browse by Category
						</h1>
						<p className="px-4 text-base text-muted-foreground sm:px-0 sm:text-lg">
							Discover the perfect tools organized by what you need. From AI to
							design, development to marketing.
						</p>
					</div>
				</Container>

				<CategoriesContent
					categories={categories}
					categoryToolPreviews={categoryToolPreviews}
				/>

				<Container className="mt-12 sm:mt-16 lg:mt-20">
					<div className="rounded-2xl bg-primary p-8 text-center text-white transition-all duration-300 hover:shadow-primary/20 hover:shadow-xl sm:rounded-3xl sm:p-10 lg:p-12">
						<h2 className="mb-3 font-serif text-2xl sm:mb-4 sm:text-3xl md:text-4xl">
							Can't find what you're looking for?
						</h2>
						<p className="mx-auto mb-6 max-w-xl text-sm text-white/70 sm:mb-8 sm:text-base">
							Contribute a Tool you love and help fellow builders discover it.
						</p>
						<Link
							href="/submit"
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
