"use client";

import type {
	CategoryWithCount,
	StackWithCount,
	Tag,
} from "@missingstack/api/types";
import Link from "next/link";
import { getIcon } from "~/lib/icons";
import { StackFilterSidebar } from "./stack-filter-sidebar";

interface StackSidebarProps {
	categories: CategoryWithCount[];
	relatedStacks: StackWithCount[];
	tags: Tag[];
}

export function StackSidebar({
	categories,
	relatedStacks,
	tags,
}: StackSidebarProps) {
	return (
		<aside className="w-full shrink-0 lg:w-64">
			<div className="space-y-4 sm:space-y-6 lg:sticky lg:top-24">
				{/* Quick Filters - Hidden on mobile, shown on desktop */}
				<div className="hidden rounded-xl border border-border/50 bg-white p-4 sm:p-5 lg:block">
					<StackFilterSidebar tags={tags} />
				</div>

				{/* Stack Categories - Visible on both mobile and desktop */}
				{categories.length > 0 && (
					<div className="rounded-xl border border-border/50 bg-white p-4 sm:p-5">
						<h3 className="mb-3 font-semibold text-xs sm:mb-4 sm:text-sm">
							Stack Categories
						</h3>
						<div className="space-y-1.5 sm:space-y-2">
							{categories.map((cat) => {
								const Icon = getIcon(cat.icon);
								return (
									<Link
										key={cat.id}
										href={`/categories/${cat.slug}`}
										className="-mx-2 group flex min-h-[44px] items-center gap-2.5 rounded-lg p-2 transition-all duration-200 hover:bg-secondary/50 active:scale-[0.98] sm:gap-3"
									>
										<Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-primary sm:h-4 sm:w-4" />
										<span className="flex-1 text-muted-foreground text-xs transition-colors duration-200 group-hover:text-primary sm:text-sm">
											{cat.name}
										</span>
										<span className="text-[10px] text-muted-foreground/70 sm:text-xs">
											{cat.toolCount}
										</span>
									</Link>
								);
							})}
						</div>
					</div>
				)}

				{/* Related Stacks - Visible on both mobile and desktop */}
				{relatedStacks.length > 0 && (
					<div className="rounded-xl border border-border/50 bg-white p-4 sm:p-5">
						<h3 className="mb-3 font-semibold text-xs sm:mb-4 sm:text-sm">
							Related Stacks
						</h3>
						<div className="space-y-1.5 sm:space-y-2">
							{relatedStacks.map((relatedStack) => {
								const Icon = relatedStack.icon
									? getIcon(relatedStack.icon)
									: null;
								return (
									<Link
										key={relatedStack.id}
										href={`/stacks/${relatedStack.slug}`}
										className="-mx-2 group flex min-h-[44px] items-center gap-2.5 rounded-lg p-2 transition-all duration-200 hover:bg-secondary/50 active:scale-[0.98] sm:gap-3"
									>
										{Icon && (
											<Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-primary sm:h-4 sm:w-4" />
										)}
										<span className="flex-1 text-muted-foreground text-xs transition-colors duration-200 group-hover:text-primary sm:text-sm">
											{relatedStack.name}
										</span>
										<span className="text-[10px] text-muted-foreground/70 sm:text-xs">
											{relatedStack.toolCount}
										</span>
									</Link>
								);
							})}
						</div>
					</div>
				)}
			</div>
		</aside>
	);
}
