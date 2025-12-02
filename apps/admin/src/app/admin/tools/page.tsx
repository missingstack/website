import { Suspense } from "react";
import { TableSkeleton } from "~/components/admin/table-skeleton";
import { ToolsTable } from "~/components/admin/tools-table";

export default function AdminToolsPage() {
	return (
		<div className="flex flex-1 flex-col gap-4">
			<div>
				<h2 className="font-bold text-2xl tracking-tight">Tools</h2>
				<p className="text-muted-foreground text-sm">
					Manage and organize tools
				</p>
			</div>
			<Suspense fallback={<TableSkeleton columnCount={5} />}>
				<ToolsTable />
			</Suspense>
		</div>
	);
}
