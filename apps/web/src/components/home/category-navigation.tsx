"use client";

import type { CategoryWithCount } from "@missingstack/api/features/categories/categories.types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getIcon } from "~/lib/icons";

interface CategoryNavigationProps {
	categories: CategoryWithCount[];
}

export function CategoryNavigation({ categories }: CategoryNavigationProps) {
	const pathname = usePathname();

	return (
		<nav className="no-scrollbar -mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-6">
			{categories.map((cat) => {
				const Icon = getIcon(cat.icon);
				const isActive = pathname === `/categories/${cat.slug}`;

				return (
					<Link
						key={cat.id}
						href="/"
						className={`group flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 font-medium text-sm transition-colors ${
							isActive
								? "bg-primary text-white shadow-md hover:bg-primary/90"
								: "text-muted-foreground hover:bg-secondary/80 hover:text-primary"
						}`}
					>
						<Icon
							className={`h-4 w-4 transition-opacity ${
								isActive ? "opacity-100" : "opacity-50 group-hover:opacity-80"
							}`}
						/>
						<span>{cat.name}</span>
						<span
							className={`rounded-md px-1.5 py-0.5 font-normal text-xs ${
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
			<Link
				href="/"
				className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 font-medium text-primary text-sm transition-colors hover:bg-primary/5"
			>
				View All
				<ArrowRight className="h-3.5 w-3.5" />
			</Link>
		</nav>
	);
}
