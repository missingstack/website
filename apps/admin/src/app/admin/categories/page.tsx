import { CategoriesTable } from "~/components/admin/categories-table";

export default function AdminCategoriesPage() {
	return (
		<div className="flex flex-1 flex-col gap-4">
			<div>
				<h2 className="font-bold text-2xl tracking-tight">Categories</h2>
				<p className="text-muted-foreground text-sm">
					Manage and organize tool categories
				</p>
			</div>
			<CategoriesTable />
		</div>
	);
}
