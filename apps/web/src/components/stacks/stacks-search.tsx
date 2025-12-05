"use client";

import { Search, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

interface StacksSearchProps {
	value: string;
	onChange: (value: string) => void;
	resultCount?: number;
}

export function StacksSearch({
	value,
	onChange,
	resultCount,
}: StacksSearchProps) {
	const hasSearchQuery = value.trim().length > 0;

	return (
		<section className="mx-auto mb-12 max-w-7xl px-4 sm:mb-16 sm:px-6">
			<div className="relative mx-auto max-w-xl">
				<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground sm:left-4 sm:h-5 sm:w-5" />
				<Input
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder="Search stacks..."
					className="h-12 w-full rounded-xl border-border bg-white pr-10 pl-10 text-sm shadow-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-14 sm:rounded-2xl sm:pr-12 sm:pl-12 sm:text-base"
				/>
				{hasSearchQuery && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onChange("")}
						className="-translate-y-1/2 absolute top-1/2 right-1.5 flex h-8 min-h-[44px] w-8 items-center justify-center p-0 transition-all duration-200 hover:scale-110 active:scale-95 sm:right-2"
					>
						<X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
						<span className="sr-only">Clear search</span>
					</Button>
				)}
			</div>
			{hasSearchQuery && resultCount !== undefined && (
				<p className="mt-3 text-center text-muted-foreground text-xs sm:mt-4 sm:text-sm">
					Found {resultCount} {resultCount === 1 ? "stack" : "stacks"}
				</p>
			)}
		</section>
	);
}
