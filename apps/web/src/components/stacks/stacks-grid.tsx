"use client";

import type { StackWithCount } from "@missingstack/api/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getIcon } from "~/lib/icons";

interface StacksGridProps {
	stacks: StackWithCount[];
	hasSearchQuery: boolean;
	totalStacks: number;
}

export function StacksGrid({
	stacks,
	hasSearchQuery,
	totalStacks,
}: StacksGridProps) {
	if (stacks.length === 0) {
		return null;
	}

	return (
		<section className="mx-auto max-w-7xl px-4 sm:px-6">
			<h2 className="mb-6 text-primary text-xl sm:mb-8 sm:text-2xl">
				{hasSearchQuery
					? "Search Results"
					: `All ${totalStacks} Technology Stacks`}
			</h2>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
				{stacks.map((stack) => {
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
		</section>
	);
}
