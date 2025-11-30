"use client";

import type { Category } from "@missingstack/api/types";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "~/components/ui/button";
import { CategoryNavigation } from "./category-navigation";
import { GlobalSearch } from "./global-search";

interface HeaderContentProps {
	categories: Category[];
	stats: { totalTools: number; totalCategories: number };
	topCategories: Category[];
}

export function HeaderContent({
	categories,
	stats,
	topCategories,
}: HeaderContentProps) {
	const searchRef = useRef<{ open: () => void }>(null);

	return (
		<header className="sticky top-0 z-50 w-full border-border/50 border-b bg-white/80 backdrop-blur-lg transition-shadow duration-300">
			<div className="relative mx-auto w-screen max-w-7xl px-4 sm:px-6">
				<div className="flex h-14 items-center justify-between gap-3 py-2 sm:h-16 sm:gap-4 sm:py-3">
					<Link
						href="/"
						className="group flex items-center gap-2 transition-transform duration-200 active:scale-95 sm:gap-2.5"
					>
						<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary font-bold font-serif text-lg text-white italic shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md sm:h-9 sm:w-9 sm:text-xl">
							M
						</div>
						<span className="font-semibold text-base tracking-tight sm:text-lg">
							Missing stack
						</span>
					</Link>

					<div className="hidden md:block">
						<GlobalSearch
							ref={searchRef}
							initialCategories={categories}
							totalTools={stats.totalTools}
							hideMobileTrigger={true}
						/>
					</div>

					<div className="flex items-center gap-2 sm:gap-3">
						<button
							type="button"
							onClick={() => searchRef.current?.open()}
							className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-muted-foreground transition-all duration-200 hover:bg-secondary/50 hover:text-foreground active:scale-95 md:hidden"
							aria-label="Search"
						>
							<Search className="h-5 w-5" />
						</button>
						<Button
							size="sm"
							className="rounded-full px-4 text-xs transition-all duration-300 hover:scale-105 active:scale-95 sm:px-5 sm:text-sm"
							asChild
						>
							<Link href="/">Submit Tool</Link>
						</Button>
					</div>
				</div>

				<CategoryNavigation categories={topCategories} />

				{/* Hidden GlobalSearch instance for mobile - shares dialog via ref */}
				<div className="pointer-events-none absolute opacity-0 md:hidden">
					<GlobalSearch
						ref={searchRef}
						initialCategories={categories}
						totalTools={stats.totalTools}
						hideMobileTrigger={true}
					/>
				</div>
			</div>
		</header>
	);
}
