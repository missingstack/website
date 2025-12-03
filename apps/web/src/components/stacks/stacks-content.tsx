"use client";

import type { StackWithCount, ToolData } from "@missingstack/api/types";
import { ArrowRight, Search, Sparkles, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { getIcon } from "~/lib/icons";

interface StacksContentProps {
	stacks: StackWithCount[];
	stackToolPreviews: { stack: StackWithCount; tools: ToolData[] }[];
}

export function StacksContent({
	stacks,
	stackToolPreviews,
}: StacksContentProps) {
	const [searchQuery, setSearchQuery] = useState("");

	// Filter stacks based on search query
	const filteredStacks = useMemo(() => {
		if (!searchQuery.trim()) {
			return stacks;
		}

		const query = searchQuery.toLowerCase();
		return stacks.filter(
			(stack) =>
				stack.name.toLowerCase().includes(query) ||
				stack.description?.toLowerCase().includes(query),
		);
	}, [stacks, searchQuery]);

	// Filter stack previews based on search
	const filteredStackPreviews = useMemo(() => {
		if (!searchQuery.trim()) {
			return stackToolPreviews;
		}

		const query = searchQuery.toLowerCase();
		return stackToolPreviews.filter(
			({ stack }) =>
				stack.name.toLowerCase().includes(query) ||
				stack.description?.toLowerCase().includes(query),
		);
	}, [stackToolPreviews, searchQuery]);

	const hasSearchQuery = searchQuery.trim().length > 0;

	return (
		<>
			{/* Search Bar */}
			<section className="mx-auto mb-12 max-w-7xl px-4 sm:mb-16 sm:px-6">
				<div className="relative mx-auto max-w-xl">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground sm:left-4 sm:h-5 sm:w-5" />
					<Input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search stacks..."
						className="h-12 w-full rounded-xl border-border bg-white pr-10 pl-10 text-sm shadow-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-14 sm:rounded-2xl sm:pr-12 sm:pl-12 sm:text-base"
					/>
					{hasSearchQuery && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSearchQuery("")}
							className="-translate-y-1/2 absolute top-1/2 right-1.5 flex h-8 min-h-[44px] w-8 items-center justify-center p-0 transition-all duration-200 hover:scale-110 active:scale-95 sm:right-2"
						>
							<X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
							<span className="sr-only">Clear search</span>
						</Button>
					)}
				</div>
				{hasSearchQuery && (
					<p className="mt-3 text-center text-muted-foreground text-xs sm:mt-4 sm:text-sm">
						Found {filteredStacks.length}{" "}
						{filteredStacks.length === 1 ? "stack" : "stacks"}
					</p>
				)}
			</section>

			{/* Top Stacks Section - Only show if not searching or if results found */}
			{(!hasSearchQuery || filteredStackPreviews.length > 0) && (
				<section className="mx-auto mb-12 max-w-7xl px-4 sm:mb-16 sm:px-6 lg:mb-20">
					<div className="mb-6 flex items-center justify-between sm:mb-8">
						<h2 className="flex items-center gap-2 text-primary text-xl sm:text-2xl">
							<Sparkles className="h-4 w-4 text-yellow-500 sm:h-5 sm:w-5" />
							<span>
								{hasSearchQuery
									? "Matching Stacks"
									: "Featured Technology Stacks"}
							</span>
						</h2>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
						{filteredStackPreviews.map(({ stack, tools }) => {
							const Icon = stack.icon ? getIcon(stack.icon) : null;
							return (
								<Link
									key={stack.id}
									href={`/stacks/${stack.slug}`}
									className="group hover:-translate-y-1 relative rounded-xl border border-border/50 bg-white p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-lg active:scale-[0.98] sm:rounded-2xl sm:p-6"
								>
									<div className="mb-4 flex items-start justify-between">
										<div className="flex min-w-0 items-center gap-3 sm:gap-4">
											{Icon && (
												<div className="rounded-lg bg-secondary/80 p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/10 sm:rounded-xl sm:p-3">
													<Icon className="h-5 w-5 text-primary transition-colors duration-200 sm:h-6 sm:w-6" />
												</div>
											)}
											<div className="min-w-0 flex-1">
												<h3 className="font-semibold text-base text-primary transition-colors duration-200 group-hover:text-blue-600 sm:text-lg">
													{stack.name}
												</h3>
												<p className="line-clamp-1 text-muted-foreground text-xs sm:text-sm">
													{stack.description}
												</p>
											</div>
										</div>
										<ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary sm:h-5 sm:w-5" />
									</div>

									<div className="flex items-center gap-3 border-border/50 border-t pt-3 sm:pt-4">
										<div className="-space-x-2 flex">
											{tools.slice(0, 4).map((tool) => (
												<div
													key={tool.id}
													className="relative h-7 w-7 overflow-hidden rounded-lg border-2 border-white bg-secondary transition-transform duration-200 group-hover:scale-110 sm:h-8 sm:w-8"
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
										<span className="text-muted-foreground text-xs sm:text-sm">
											{stack.toolCount} tools
										</span>
									</div>
								</Link>
							);
						})}
					</div>
				</section>
			)}

			{(!hasSearchQuery || filteredStacks.length > 0) && (
				<section className="mx-auto max-w-7xl px-4 sm:px-6">
					<h2 className="mb-6 text-primary text-xl sm:mb-8 sm:text-2xl">
						{hasSearchQuery
							? "Search Results"
							: `All ${stacks.length} Technology Stacks`}
					</h2>

					{filteredStacks.length === 0 ? (
						<div className="rounded-xl bg-secondary/20 py-10 text-center sm:rounded-2xl sm:py-12">
							<p className="mb-4 text-muted-foreground text-sm sm:text-base">
								No stacks found matching &quot;{searchQuery}&quot;
							</p>
							<Button
								variant="outline"
								onClick={() => setSearchQuery("")}
								className="transition-all duration-200 hover:scale-105 active:scale-95"
							>
								Clear search
							</Button>
						</div>
					) : (
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
							{filteredStacks.map((stack) => {
								const Icon = stack.icon ? getIcon(stack.icon) : null;
								return (
									<Link
										key={stack.id}
										href={`/stacks/${stack.slug}`}
										className="group hover:-translate-y-0.5 flex min-h-[64px] items-center gap-3 rounded-lg border border-border/50 bg-white p-3 transition-all duration-300 hover:border-primary/20 hover:shadow-md active:scale-[0.98] sm:gap-4 sm:rounded-xl sm:p-4"
									>
										{Icon && (
											<div className="rounded-md bg-secondary/60 p-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/10 sm:rounded-lg sm:p-2.5">
												<Icon className="h-4 w-4 text-primary transition-colors duration-200 sm:h-5 sm:w-5" />
											</div>
										)}
										<div className="min-w-0 flex-1">
											<h3 className="truncate font-medium text-primary text-sm transition-colors duration-200 group-hover:text-blue-600 sm:text-base">
												{stack.name}
											</h3>
											<p className="text-muted-foreground text-xs sm:text-sm">
												{stack.toolCount} tools
											</p>
										</div>
										<ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 sm:h-4 sm:w-4" />
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
