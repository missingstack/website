"use client";

import { TableHead, TableHeader, TableRow } from "~/components/ui/table";
import type { CategorySortColumn } from "~/lib/search-params";
import { CategoriesTableSortButton } from "./categories-table-sort-button";

interface CategoriesTableHeaderProps {
	sortBy?: CategorySortColumn;
	sortOrder?: "asc" | "desc";
	onSort: (column: CategorySortColumn) => void;
}

export function CategoriesTableHeader({
	sortBy,
	sortOrder,
	onSort,
}: CategoriesTableHeaderProps) {
	return (
		<TableHeader>
			<TableRow>
				<TableHead className="w-[100px]">
					<div className="flex items-center gap-2">
						<span>Name</span>
						<CategoriesTableSortButton
							column="name"
							isActive={sortBy === "name"}
							sortOrder={sortOrder}
							onClick={() => onSort("name")}
						/>
					</div>
				</TableHead>
				<TableHead>
					<div className="flex items-center gap-2">
						<span>Slug</span>
						<CategoriesTableSortButton
							column="slug"
							isActive={sortBy === "slug"}
							sortOrder={sortOrder}
							onClick={() => onSort("slug")}
						/>
					</div>
				</TableHead>
				<TableHead className="w-[100px]">
					<div className="flex items-center gap-2">
						<span>Weight</span>
						<CategoriesTableSortButton
							column="weight"
							isActive={sortBy === "weight"}
							sortOrder={sortOrder}
							onClick={() => onSort("weight")}
						/>
					</div>
				</TableHead>
				<TableHead className="w-[200px]">
					<div className="flex items-center gap-2">
						<span>Created</span>
						<CategoriesTableSortButton
							column="createdAt"
							isActive={sortBy === "createdAt"}
							sortOrder={sortOrder}
							onClick={() => onSort("createdAt")}
						/>
					</div>
				</TableHead>
				<TableHead className="w-[100px]">Description</TableHead>
				<TableHead className="w-[100px]">Icon</TableHead>
				<TableHead className="w-[100px]">Actions</TableHead>
			</TableRow>
		</TableHeader>
	);
}
