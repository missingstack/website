"use client";

import { Plus } from "lucide-react";
import { Suspense, useState } from "react";
import { NewTagForm } from "~/components/admin/new-tag-form";
import { TableSkeleton } from "~/components/admin/table-skeleton";
import { TagsTable } from "~/components/admin/tags-table";
import { Button } from "~/components/ui/button";

export default function AdminTagsPage() {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	return (
		<div className="flex flex-1 flex-col gap-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-2xl tracking-tight">Tags</h2>
					<p className="text-muted-foreground text-sm">
						Manage and organize tags
					</p>
				</div>
				<Button onClick={() => setIsDrawerOpen(true)}>
					<Plus className="mr-2 h-4 w-4" />
					New Tag
				</Button>
			</div>
			<Suspense fallback={<TableSkeleton columnCount={5} />}>
				<TagsTable />
			</Suspense>
			<NewTagForm open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
		</div>
	);
}
