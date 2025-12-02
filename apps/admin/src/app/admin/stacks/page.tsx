import { Suspense } from "react";
import { StacksTable } from "~/components/admin/stacks-table";
import { TableSkeleton } from "~/components/admin/table-skeleton";

export default function AdminStacksPage() {
	return (
		<div className="flex flex-1 flex-col gap-4">
			<div>
				<h2 className="font-bold text-2xl tracking-tight">Stacks</h2>
				<p className="text-muted-foreground text-sm">
					Manage and organize technology stacks
				</p>
			</div>
			<Suspense fallback={<TableSkeleton columnCount={5} />}>
				<StacksTable />
			</Suspense>
		</div>
	);
}
