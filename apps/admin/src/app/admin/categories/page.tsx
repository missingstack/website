"use client";

import { Plus } from "lucide-react";
import { Suspense, useState } from "react";
import { CategoriesTable } from "~/components/admin/categories-table";
import { NewCategoryForm } from "~/components/admin/new-category-form";
import { TableSkeleton } from "~/components/admin/table-skeleton";
import { Button } from "~/components/ui/button";

export default function AdminCategoriesPage() {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	return (
		<div className="flex flex-1 flex-col gap-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-2xl tracking-tight">Categories</h2>
					<p className="text-muted-foreground text-sm">
						Manage and organize tool categories
					</p>
				</div>
				<Button onClick={() => setIsDrawerOpen(true)}>
					<Plus className="mr-2 h-4 w-4" />
					New Category
				</Button>
			</div>

			<Suspense fallback={<TableSkeleton columnCount={5} />}>
				<CategoriesTable />
			</Suspense>
			<NewCategoryForm open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
		</div>
	);
}
