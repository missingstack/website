"use client";

import { Plus } from "lucide-react";
import { Suspense, useState } from "react";
import { NewToolForm } from "~/components/admin/new-tool-form";
import { TableSkeleton } from "~/components/admin/table-skeleton";
import { ToolsTable } from "~/components/admin/tools-table";
import { Button } from "~/components/ui/button";

export default function AdminToolsPage() {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	return (
		<div className="flex flex-1 flex-col gap-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-2xl tracking-tight">Tools</h2>
					<p className="text-muted-foreground text-sm">
						Manage and organize tools
					</p>
				</div>
				<Button onClick={() => setIsDrawerOpen(true)}>
					<Plus className="mr-2 h-4 w-4" />
					New Tool
				</Button>
			</div>
			<Suspense fallback={<TableSkeleton columnCount={5} />}>
				<ToolsTable />
			</Suspense>
			<NewToolForm open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
		</div>
	);
}
