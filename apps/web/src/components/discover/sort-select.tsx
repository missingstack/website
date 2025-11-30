"use client";

import { ArrowUpDown } from "lucide-react";
import { useQueryState } from "nuqs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { SORT_OPTIONS, searchParamsParsers } from "~/lib/search-params";

export function SortSelect() {
	const [sort, setSort] = useQueryState("sortBy", {
		...searchParamsParsers.sortBy,
		shallow: false,
	});

	return (
		<Select
			value={sort ?? "newest"}
			onValueChange={(value) =>
				setSort(value as (typeof SORT_OPTIONS)[number]["value"])
			}
		>
			<SelectTrigger className="w-[160px] border-border/50 bg-white">
				<ArrowUpDown className="h-4 w-4 text-muted-foreground" />
				<SelectValue placeholder="Sort by" />
			</SelectTrigger>
			<SelectContent>
				{SORT_OPTIONS.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
