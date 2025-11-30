"use client";

import { Loader2, Search, X } from "lucide-react";
import { useQueryState } from "nuqs";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { searchParamsParsers } from "~/lib/search-params";
import { cn } from "~/lib/utils";

interface SearchInputProps {
	placeholder?: string;
	className?: string;
}

export function SearchInput({
	placeholder = "Search tools...",
	className,
}: SearchInputProps) {
	const [query, setQuery] = useQueryState("search", {
		...searchParamsParsers.search,
		shallow: false,
		throttleMs: 300,
	});

	const isPending = false; // nuqs handles this internally

	return (
		<div className={cn("relative", className)}>
			<Search className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-muted-foreground" />
			<Input
				type="text"
				value={query ?? ""}
				onChange={(e) => setQuery(e.target.value || null)}
				placeholder={placeholder}
				className="h-12 rounded-xl border-border bg-white pr-12 pl-12"
			/>
			{isPending ? (
				<Loader2 className="-translate-y-1/2 absolute top-1/2 right-4 h-5 w-5 animate-spin text-muted-foreground" />
			) : query ? (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setQuery(null)}
					className="-translate-y-1/2 absolute top-1/2 right-2 h-8 w-8 p-0"
				>
					<X className="h-4 w-4" />
					<span className="sr-only">Clear search</span>
				</Button>
			) : null}
		</div>
	);
}
