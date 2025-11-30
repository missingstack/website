"use client";

import type { Category } from "@missingstack/api/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getIcon } from "~/lib/icons";

interface CategoryNavigationProps {
	categories: Category[];
}

export function CategoryNavigation({ categories }: CategoryNavigationProps) {
	const pathname = usePathname();

	return (
		<div className="flex items-center gap-3 pb-4 sm:gap-4 sm:pb-6">
			<nav className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto px-1 py-2 sm:gap-3 sm:py-2.5">
				{categories.map((cat) => {
					const Icon = getIcon(cat.icon);
					const isActive = pathname === `/categories/${cat.slug}`;

					return (
						<Link
							key={cat.id}
							href={`/categories/${cat.slug}`}
							className={`group flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 font-medium text-xs transition-all duration-200 active:scale-95 sm:gap-2 sm:px-3.5 sm:text-sm ${
								isActive
									? "bg-primary text-white shadow-md hover:bg-primary/90 hover:shadow-lg"
									: "text-muted-foreground hover:bg-secondary/80 hover:text-primary"
							}`}
						>
							<Icon
								className={`h-3.5 w-3.5 transition-opacity duration-200 sm:h-4 sm:w-4 ${
									isActive ? "opacity-100" : "opacity-50 group-hover:opacity-80"
								}`}
							/>
							<span>{cat.name}</span>
							<span
								className={`rounded-md px-1.5 py-0.5 font-normal text-[10px] transition-colors duration-200 sm:text-xs ${
									isActive
										? "bg-white/20 text-white"
										: "bg-secondary text-muted-foreground/70"
								}`}
							>
								{cat.toolCount}
							</span>
						</Link>
					);
				})}
			</nav>

			<div className="shrink-0 pl-2 sm:pl-3">
				<Link
					href="/categories"
					className="flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-2 py-2 font-medium text-primary text-xs transition-all duration-200 hover:bg-primary/5 active:scale-95 active:bg-primary/10 sm:px-3.5 sm:text-sm"
				>
					<span className="hidden sm:inline">View All</span>
					<span className="sm:hidden">All</span>
					<ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 sm:h-3.5 sm:w-3.5" />
				</Link>
			</div>
		</div>
	);
}
