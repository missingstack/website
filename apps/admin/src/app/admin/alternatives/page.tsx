import { Suspense } from "react";
import { AlternativesTable } from "~/components/admin/alternatives-table";
import { TableSkeleton } from "~/components/admin/table-skeleton";

export default function AdminAlternativesPage() {
	return (
		<div className="flex flex-1 flex-col gap-4">
			<div>
				<h2 className="font-bold text-2xl tracking-tight">Alternative Tools</h2>
				<p className="text-muted-foreground text-sm">
					View all tools with their alternative counts
				</p>
			</div>
			<Suspense fallback={<TableSkeleton columnCount={6} />}>
				<AlternativesTable />
			</Suspense>
		</div>
	);
}
