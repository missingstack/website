"use client";

import type { Tag } from "@missingstack/api/types";
import { SlidersHorizontal } from "lucide-react";
import { useQueryStates } from "nuqs";
import { Button } from "~/components/ui/button";
import { Toggle } from "~/components/ui/toggle";
import { PRICING_OPTIONS, searchParamsParsers } from "~/lib/search-params";

interface CategoryFilterSidebarProps {
	tags: Tag[];
	className?: string;
	showHeader?: boolean;
}

export function CategoryFilterSidebar({
	tags,
	className,
	showHeader = true,
}: CategoryFilterSidebarProps) {
	const [filters, setFilters] = useQueryStates(
		{
			pricing: searchParamsParsers.pricing,
			tagIds: searchParamsParsers.tagIds,
		},
		{ shallow: false },
	);

	const hasFilters = filters.pricing.length > 0 || filters.tagIds.length > 0;

	const toggleArrayValue = (key: "pricing" | "tagIds", value: string) => {
		const current = filters[key];
		const newValues = current.includes(value)
			? current.filter((v) => v !== value)
			: [...current, value];
		setFilters({ [key]: newValues.length > 0 ? newValues : null });
	};

	const clearAllFilters = () => {
		setFilters({
			pricing: null,
			tagIds: null,
		});
	};

	return (
		<div className={className}>
			{showHeader && (
				<div className="mb-4 flex items-center justify-between">
					<div className="flex items-center gap-2 font-semibold text-primary text-sm">
						<SlidersHorizontal className="h-4 w-4" />
						Quick Filters
					</div>
					{hasFilters && (
						<Button
							variant="ghost"
							size="sm"
							className="h-auto py-1 text-xs"
							onClick={clearAllFilters}
						>
							Clear all
						</Button>
					)}
				</div>
			)}
			{!showHeader && hasFilters && (
				<div className="mb-4 flex justify-end">
					<Button
						variant="ghost"
						size="sm"
						className="h-auto py-1 text-xs"
						onClick={clearAllFilters}
					>
						Clear all
					</Button>
				</div>
			)}

			<div className="mb-5">
				<h4 className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
					Pricing
				</h4>
				<div className="flex flex-wrap gap-2">
					{PRICING_OPTIONS.map((pricing) => {
						const isSelected = filters.pricing.includes(pricing);
						return (
							<Toggle
								key={pricing}
								pressed={isSelected}
								onPressedChange={() => toggleArrayValue("pricing", pricing)}
								size="sm"
								variant="outline"
								className="rounded-full px-3 text-xs data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
							>
								{pricing}
							</Toggle>
						);
					})}
				</div>
			</div>

			<div>
				<h4 className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
					Tags
				</h4>
				<div className="flex flex-wrap gap-2">
					{tags.slice(0, 6).map((tag) => {
						const isSelected = filters.tagIds.includes(tag.id);
						return (
							<Toggle
								key={tag.id}
								pressed={isSelected}
								onPressedChange={() => toggleArrayValue("tagIds", tag.id)}
								size="sm"
								variant="outline"
								className="rounded-full px-3 text-xs data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
							>
								{tag.name}
							</Toggle>
						);
					})}
				</div>
			</div>
		</div>
	);
}
