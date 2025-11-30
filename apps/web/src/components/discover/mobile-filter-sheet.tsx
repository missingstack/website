"use client";

import type { Category, Tag } from "@missingstack/api/types";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "~/components/ui/sheet";
import { FilterSidebar } from "./filter-sidebar";

interface MobileFilterSheetProps {
	categories: Category[];
	tags: Tag[];
	pricingOptions: readonly string[];
	platformOptions: readonly string[];
	filterCount: number;
}

export function MobileFilterSheet({
	categories,
	tags,
	pricingOptions,
	platformOptions,
	filterCount,
}: MobileFilterSheetProps) {
	const [open, setOpen] = useState(false);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2 lg:hidden">
					<SlidersHorizontal className="h-4 w-4" />
					Filters
					{filterCount > 0 && (
						<span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
							{filterCount}
						</span>
					)}
				</Button>
			</SheetTrigger>
			<SheetContent
				side="bottom"
				className="flex h-[85vh] max-h-[85vh] flex-col p-0"
			>
				<SheetHeader className="shrink-0 border-b px-6 pt-6 pb-4">
					<SheetTitle>Filters</SheetTitle>
				</SheetHeader>
				<ScrollArea className="min-h-0 flex-1">
					<div className="px-6 py-4">
						<FilterSidebar
							categories={categories}
							tags={tags}
							pricingOptions={pricingOptions}
							platformOptions={platformOptions}
						/>
					</div>
				</ScrollArea>
				<SheetFooter className="shrink-0 border-t px-6 pt-4 pb-6">
					<Button onClick={() => setOpen(false)} className="w-full">
						Apply Filters
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
