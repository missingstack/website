"use client";

import type { Category } from "@missingstack/api/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getIcon } from "~/lib/icons";

interface StickyCategoryNavProps {
	categories: Category[];
}

export function StickyCategoryNav({ categories }: StickyCategoryNavProps) {
	const [isSticky, setIsSticky] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		const handleScroll = () => {
			// Show sticky nav after scrolling past 200px
			setIsSticky(window.scrollY > 200);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	if (!isSticky) return null;

	// Filter to only show categories with tools
	const activeCategories = categories.filter((cat) => cat.toolCount > 0);

	return (
		<div className="fixed top-16 right-0 left-0 z-40 border-border/50 border-b bg-white/95 shadow-sm backdrop-blur-sm">
			<div className="mx-auto max-w-7xl px-6">
				<div className="no-scrollbar scrollbar-hide flex items-center gap-2 overflow-x-auto py-3">
					<span className="mr-2 shrink-0 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
						Jump to:
					</span>
					{activeCategories.map((category) => {
						const Icon = getIcon(category.icon);
						const isActive = pathname === `/categories/${category.slug}`;

						return (
							<Link
								key={category.id}
								href={`/categories/${category.slug}`}
								className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 font-medium text-sm transition-all ${
									isActive
										? "bg-primary text-white shadow-md"
										: "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-primary"
								}`}
							>
								<Icon className="h-4 w-4" />
								<span>{category.name}</span>
								<span className="text-xs opacity-70">
									({category.toolCount})
								</span>
							</Link>
						);
					})}
				</div>
			</div>
		</div>
	);
}
