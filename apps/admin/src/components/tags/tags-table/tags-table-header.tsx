"use client";

import { TableHead, TableHeader, TableRow } from "~/components/ui/table";
import type { TagSortColumn } from "~/lib/search-params";
import { TagsTableSortButton } from "./tags-table-sort-button";

interface TagsTableHeaderProps {
	sortBy: TagSortColumn;
	sortOrder: "asc" | "desc";
	onSort: (column: TagSortColumn) => void;
}

export function TagsTableHeader({
	sortBy,
	sortOrder,
	onSort,
}: TagsTableHeaderProps) {
	return (
		<TableHeader>
			<TableRow>
				<TableHead className="w-[100px]">
					<div className="flex items-center gap-2">
						<span>Name</span>
						<TagsTableSortButton
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
						<TagsTableSortButton
							column="slug"
							isActive={sortBy === "slug"}
							sortOrder={sortOrder}
							onClick={() => onSort("slug")}
						/>
					</div>
				</TableHead>
				<TableHead className="w-[150px]">Type</TableHead>
				<TableHead className="w-[100px]">Color</TableHead>
				<TableHead className="w-[200px]">
					<div className="flex items-center gap-2">
						<span>Created</span>
						<TagsTableSortButton
							column="createdAt"
							isActive={sortBy === "createdAt"}
							sortOrder={sortOrder}
							onClick={() => onSort("createdAt")}
						/>
					</div>
				</TableHead>
				<TableHead className="w-[100px]">Actions</TableHead>
			</TableRow>
		</TableHeader>
	);
}
