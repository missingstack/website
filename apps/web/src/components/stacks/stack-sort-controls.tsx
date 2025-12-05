"use client";

import { ArrowUpDown, Grid3X3, List } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { SORT_OPTIONS } from "~/lib/search-params";

interface StackSortControlsProps {
	sortBy: string;
	onSortChange: (value: "newest" | "name" | "popular") => void;
}

export function StackSortControls({
	sortBy,
	onSortChange,
}: StackSortControlsProps) {
	return (
		<div className="flex items-center gap-3">
			<Select value={sortBy} onValueChange={onSortChange}>
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

			<div className="hidden items-center overflow-hidden rounded-lg border border-border sm:flex">
				<Button
					type="button"
					size="icon"
					variant="ghost"
					className="rounded-none bg-primary text-white hover:bg-primary"
					aria-label="Grid view"
				>
					<Grid3X3 className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					size="icon"
					variant="ghost"
					className="rounded-none"
					aria-label="List view"
				>
					<List className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
