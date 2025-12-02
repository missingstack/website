"use client";

import type { CategoryWithCount, Tag } from "@missingstack/api/types";
import { SlidersHorizontal } from "lucide-react";
import { useQueryStates } from "nuqs";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Toggle } from "~/components/ui/toggle";
import { getIcon } from "~/lib/icons";
import { searchParamsParsers } from "~/lib/search-params";
import { cn } from "~/lib/utils";

interface FilterSidebarProps {
	categories: CategoryWithCount[];
	tags: Tag[];
	pricingOptions: readonly string[];
	platformOptions: readonly string[];
	className?: string;
}

export function FilterSidebar({
	categories,
	tags,
	pricingOptions,
	platformOptions,
	className,
}: FilterSidebarProps) {
	const [filters, setFilters] = useQueryStates(
		{
			categoryIds: searchParamsParsers.categoryIds,
			pricing: searchParamsParsers.pricing,
			platforms: searchParamsParsers.platforms,
			tagIds: searchParamsParsers.tagIds,
		},
		{ shallow: false },
	);

	const hasFilters =
		filters.categoryIds.length > 0 ||
		filters.pricing.length > 0 ||
		filters.platforms.length > 0 ||
		filters.tagIds.length > 0;

	const toggleArrayValue = (
		key: "categoryIds" | "pricing" | "platforms" | "tagIds",
		value: string,
	) => {
		const current = filters[key];
		const newValues = current.includes(value)
			? current.filter((v) => v !== value)
			: [...current, value];
		setFilters({ [key]: newValues.length > 0 ? newValues : null });
	};

	const clearAllFilters = () => {
		setFilters({
			categoryIds: null,
			pricing: null,
			platforms: null,
			tagIds: null,
		});
	};

	return (
		<div className={cn("space-y-6", className)}>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 font-semibold text-primary text-sm">
					<SlidersHorizontal className="h-4 w-4" />
					Filters
				</div>
				{hasFilters && (
					<Button
						variant="ghost"
						size="sm"
						className="text-xs"
						onClick={clearAllFilters}
					>
						Clear all
					</Button>
				)}
			</div>

			{/* Categories */}
			<FilterSection title="Categories">
				<ScrollArea className="h-64 w-full">
					<div className="space-y-2 pr-4">
						{categories.map((cat) => {
							const Icon = getIcon(cat.icon);
							const isChecked = filters.categoryIds.includes(cat.id);
							const checkboxId = `category-${cat.id}`;
							return (
								<label
									key={cat.id}
									htmlFor={checkboxId}
									className="group flex cursor-pointer items-center gap-3"
								>
									<Checkbox
										id={checkboxId}
										checked={isChecked}
										onCheckedChange={() =>
											toggleArrayValue("categoryIds", cat.id)
										}
									/>
									<Icon className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover:text-primary" />
									<span className="flex-1 text-muted-foreground text-sm transition-colors group-hover:text-primary">
										{cat.name}
									</span>
									<span className="text-muted-foreground/70 text-xs">
										{cat.toolCount ?? 0}
									</span>
								</label>
							);
						})}
					</div>
				</ScrollArea>
			</FilterSection>

			{/* Pricing */}
			<FilterSection title="Pricing">
				<div className="space-y-2">
					{pricingOptions.map((pricing) => {
						const isChecked = filters.pricing.includes(pricing);
						const checkboxId = `pricing-${pricing.toLowerCase().replace(/\s+/g, "-")}`;
						return (
							<label
								key={pricing}
								htmlFor={checkboxId}
								className="group flex cursor-pointer items-center gap-3"
							>
								<Checkbox
									id={checkboxId}
									checked={isChecked}
									onCheckedChange={() => toggleArrayValue("pricing", pricing)}
								/>
								<span className="text-muted-foreground text-sm transition-colors group-hover:text-primary">
									{pricing}
								</span>
							</label>
						);
					})}
				</div>
			</FilterSection>

			{/* Platforms */}
			<FilterSection title="Platforms">
				<div className="flex flex-wrap gap-2">
					{platformOptions.map((platform) => {
						const isSelected = filters.platforms.includes(platform);
						return (
							<Toggle
								key={platform}
								pressed={isSelected}
								onPressedChange={() => toggleArrayValue("platforms", platform)}
								size="sm"
								variant="outline"
								className="rounded-full px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
							>
								{platform}
							</Toggle>
						);
					})}
				</div>
			</FilterSection>

			{/* Tags */}
			<FilterSection title="Tags">
				<div className="flex flex-wrap gap-2">
					{tags.slice(0, 8).map((tag) => {
						const isSelected = filters.tagIds.includes(tag.id);
						return (
							<Toggle
								key={tag.id}
								pressed={isSelected}
								onPressedChange={() => toggleArrayValue("tagIds", tag.id)}
								size="sm"
								variant="outline"
								className="rounded-full px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
							>
								{tag.name}
							</Toggle>
						);
					})}
				</div>
			</FilterSection>
		</div>
	);
}

function FilterSection({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="overflow-hidden rounded-xl border border-border/50 bg-white p-5">
			<h3 className="mb-4 font-semibold text-sm">{title}</h3>
			{children}
		</div>
	);
}
