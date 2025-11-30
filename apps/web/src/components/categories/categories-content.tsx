"use client";

import type { Category, ToolData } from "@missingstack/api/types";
import { ArrowRight, Search, Sparkles, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { getIcon } from "~/lib/icons";

interface CategoriesContentProps {
	categories: Category[];
	categoryToolPreviews: { category: Category; tools: ToolData[] }[];
}

export function CategoriesContent({
	categories,
	categoryToolPreviews,
}: CategoriesContentProps) {
	const [searchQuery, setSearchQuery] = useState("");

	// Filter categories based on search query
	const filteredCategories = useMemo(() => {
		if (!searchQuery.trim()) {
			return categories;
		}

		const query = searchQuery.toLowerCase();
		return categories.filter(
			(cat) =>
				cat.name.toLowerCase().includes(query) ||
				cat.description?.toLowerCase().includes(query),
		);
	}, [categories, searchQuery]);

	// Filter category previews based on search
	const filteredCategoryPreviews = useMemo(() => {
		if (!searchQuery.trim()) {
			return categoryToolPreviews;
		}

		const query = searchQuery.toLowerCase();
		return categoryToolPreviews.filter(
			({ category }) =>
				category.name.toLowerCase().includes(query) ||
				category.description?.toLowerCase().includes(query),
		);
	}, [categoryToolPreviews, searchQuery]);

	const hasSearchQuery = searchQuery.trim().length > 0;

	return (
		<>
			{/* Search Bar */}
			<section className="mx-auto mb-16 max-w-7xl px-6">
				<div className="relative mx-auto max-w-xl">
					<Search className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-muted-foreground" />
					<Input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search categories..."
						className="h-14 w-full rounded-2xl border-border bg-white pr-12 pl-12 text-base shadow-sm"
					/>
					{hasSearchQuery && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSearchQuery("")}
							className="-translate-y-1/2 absolute top-1/2 right-2 h-8 w-8 p-0"
						>
							<X className="h-4 w-4" />
							<span className="sr-only">Clear search</span>
						</Button>
					)}
				</div>
				{hasSearchQuery && (
					<p className="mt-4 text-center text-muted-foreground text-sm">
						Found {filteredCategories.length}{" "}
						{filteredCategories.length === 1 ? "category" : "categories"}
					</p>
				)}
			</section>

			{/* Top Categories Section - Only show if not searching or if results found */}
			{(!hasSearchQuery || filteredCategoryPreviews.length > 0) && (
				<section className="mx-auto mb-20 max-w-7xl px-6">
					<div className="mb-8 flex items-center justify-between">
						<h2 className="flex items-center gap-2 font-serif text-2xl text-primary">
							<Sparkles className="h-5 w-5 text-yellow-500" />
							{hasSearchQuery ? "Matching Categories" : "Top Categories"}
						</h2>
					</div>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						{filteredCategoryPreviews.map(({ category, tools }) => {
							const Icon = getIcon(category.icon);
							return (
								<Link
									key={category.id}
									href={`/categories/${category.slug}`}
									className="group relative rounded-2xl border border-border/50 bg-white p-6 transition-all hover:border-primary/20 hover:shadow-xl"
								>
									<div className="mb-4 flex items-start justify-between">
										<div className="flex items-center gap-4">
											<div className="rounded-xl bg-secondary/80 p-3 transition-colors group-hover:bg-primary/10">
												<Icon className="h-6 w-6 text-primary" />
											</div>
											<div>
												<h3 className="font-semibold text-lg text-primary transition-colors group-hover:text-blue-600">
													{category.name}
												</h3>
												<p className="text-muted-foreground text-sm">
													{category.description}
												</p>
											</div>
										</div>
										<ArrowRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
									</div>

									<div className="flex items-center gap-3 border-border/50 border-t pt-4">
										<div className="-space-x-2 flex">
											{tools.slice(0, 4).map((tool) => (
												<div
													key={tool.id}
													className="relative h-8 w-8 overflow-hidden rounded-lg border-2 border-white bg-secondary"
												>
													<Image
														src={tool.logo}
														alt={tool.name}
														fill
														className="object-cover"
														sizes="32px"
														unoptimized
													/>
												</div>
											))}
										</div>
										<span className="text-muted-foreground text-sm">
											{category.toolCount} tools
										</span>
									</div>
								</Link>
							);
						})}
					</div>
				</section>
			)}

			{(!hasSearchQuery || filteredCategories.length > 0) && (
				<section className="mx-auto max-w-7xl px-6">
					<h2 className="mb-8 font-serif text-2xl text-primary">
						{hasSearchQuery ? "Search Results" : "All Categories"}
					</h2>

					{filteredCategories.length === 0 ? (
						<div className="rounded-2xl bg-secondary/20 py-12 text-center">
							<p className="mb-4 text-muted-foreground">
								No categories found matching &quot;{searchQuery}&quot;
							</p>
							<Button variant="outline" onClick={() => setSearchQuery("")}>
								Clear search
							</Button>
						</div>
					) : (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{filteredCategories.map((cat) => {
								const Icon = getIcon(cat.icon);
								return (
									<Link
										key={cat.id}
										href={`/categories/${cat.slug}`}
										className="group flex items-center gap-4 rounded-xl border border-border/50 bg-white p-4 transition-all hover:border-primary/20 hover:shadow-lg"
									>
										<div className="rounded-lg bg-secondary/60 p-2.5 transition-colors group-hover:bg-primary/10">
											<Icon className="h-5 w-5 text-primary" />
										</div>
										<div className="min-w-0 flex-1">
											<h3 className="truncate font-medium text-primary transition-colors group-hover:text-blue-600">
												{cat.name}
											</h3>
											<p className="text-muted-foreground text-sm">
												{cat.toolCount} tools
											</p>
										</div>
										<ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
									</Link>
								);
							})}
						</div>
					)}
				</section>
			)}
		</>
	);
}
