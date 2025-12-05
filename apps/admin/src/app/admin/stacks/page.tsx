"use client";

import { Plus } from "lucide-react";
import { Suspense, useState } from "react";
import { NewStackForm } from "~/components/stacks/stack-form/new-stack-form";
import { StacksTable } from "~/components/stacks/stacks-table";
import { TableSkeleton } from "~/components/table-skeleton";
import { Button } from "~/components/ui/button";

export default function AdminStacksPage() {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	return (
		<div className="flex flex-1 flex-col gap-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-2xl tracking-tight">Stacks</h2>
					<p className="text-muted-foreground text-sm">
						Manage and organize technology stacks
					</p>
				</div>
				<Button onClick={() => setIsDrawerOpen(true)}>
					<Plus className="mr-2 h-4 w-4" />
					New Stack
				</Button>
			</div>
			<Suspense fallback={<TableSkeleton columnCount={5} />}>
				<StacksTable />
			</Suspense>
			<NewStackForm open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
		</div>
	);
}
