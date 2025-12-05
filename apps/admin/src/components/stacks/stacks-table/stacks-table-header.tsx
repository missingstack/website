"use client";

import { TableHead, TableHeader, TableRow } from "~/components/ui/table";
import type { StackSortColumn } from "~/lib/search-params";
import { StacksTableSortButton } from "./stacks-table-sort-button";

interface StacksTableHeaderProps {
	sortBy: StackSortColumn;
	sortOrder: "asc" | "desc";
	onSort: (column: StackSortColumn) => void;
}

export function StacksTableHeader({
	sortBy,
	sortOrder,
	onSort,
}: StacksTableHeaderProps) {
	return (
		<TableHeader>
			<TableRow>
				<TableHead className="w-[100px]">
					<div className="flex items-center gap-2">
						<span>Name</span>
						<StacksTableSortButton
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
						<StacksTableSortButton
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
						<StacksTableSortButton
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
						<StacksTableSortButton
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
