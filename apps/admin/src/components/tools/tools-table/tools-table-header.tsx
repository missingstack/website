"use client";

import { TableHead, TableHeader, TableRow } from "~/components/ui/table";
import type { ToolSortColumn } from "~/lib/search-params";
import { ToolsTableSortButton } from "./tools-table-sort-button";

interface ToolsTableHeaderProps {
	sortBy?: ToolSortColumn;
	sortOrder?: "asc" | "desc";
	onSort: (column: ToolSortColumn) => void;
}

export function ToolsTableHeader({
	sortBy,
	sortOrder,
	onSort,
}: ToolsTableHeaderProps) {
	return (
		<TableHeader>
			<TableRow>
				<TableHead className="w-[200px]">
					<div className="flex items-center gap-2">
						<span>Name</span>
						<ToolsTableSortButton
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
					</div>
				</TableHead>
				<TableHead className="w-[100px]">
					<div className="flex items-center gap-2">
						<span>Created</span>
						<ToolsTableSortButton
							column="newest"
							isActive={sortBy === "newest"}
							sortOrder={sortOrder}
							onClick={() => onSort("newest")}
						/>
					</div>
				</TableHead>
				<TableHead className="w-[150px]">Description</TableHead>
				<TableHead className="w-[100px]">Website</TableHead>
				<TableHead className="w-[100px]">Featured</TableHead>
				<TableHead className="w-[100px]">Actions</TableHead>
			</TableRow>
		</TableHeader>
	);
}
