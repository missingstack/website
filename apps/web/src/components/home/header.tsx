import { dependencies } from "@missingstack/api/context";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { CategoryNavigation } from "./category-navigation";

export async function getCategoriesWithCounts() {
	"use cache";
	cacheLife("days");

	const data = await dependencies.categoriesService.getTopCategories(6);
	return data || [];
}

export async function Header() {
	const [categories] = await Promise.all([getCategoriesWithCounts()]);

	// Show top 6 categories with tools
	// Filter to only show categories that have tools
	const topCategories = categories.filter((c) => c.toolCount > 0).slice(0, 6);

	return (
		<header className="sticky top-0 z-50 w-full border-border/50 border-b bg-white/80 backdrop-blur-lg">
			<div className="mx-auto max-w-7xl px-6">
				<div className="flex h-16 items-center justify-between">
					<Link href="/" className="group flex items-center gap-2.5">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-bold font-serif text-white text-xl italic shadow-sm transition-transform group-hover:scale-105">
							M
						</div>
						<span className="font-semibold text-lg tracking-tight">
							Missing stack
						</span>
					</Link>

					<div className="flex items-center gap-3">
						<Button size="sm" className="rounded-full px-5" asChild>
							<Link href="/">Submit Tool</Link>
						</Button>
					</div>
				</div>

				<CategoryNavigation categories={topCategories} />
			</div>
		</header>
	);
}
