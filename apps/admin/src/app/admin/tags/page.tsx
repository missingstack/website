import { Suspense } from "react";
import { TableSkeleton } from "~/components/admin/table-skeleton";
import { TagsTable } from "~/components/admin/tags-table";

export default function AdminTagsPage() {
	return (
		<div className="flex flex-1 flex-col gap-4">
			<div>
				<h2 className="font-bold text-2xl tracking-tight">Tags</h2>
				<p className="text-muted-foreground text-sm">
					Manage and organize tags
				</p>
			</div>
			<Suspense fallback={<TableSkeleton columnCount={5} />}>
				<TagsTable />
			</Suspense>
		</div>
	);
}
