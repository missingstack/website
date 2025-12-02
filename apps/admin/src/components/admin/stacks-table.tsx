"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	Loader2,
	Search,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { api } from "~/lib/eden";
import type { StackSortColumn } from "~/lib/search-params";

export function StacksTable() {
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState<StackSortColumn>("createdAt");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

	const { data, isLoading, isError } = useQuery({
		queryKey: ["adminStacks"],
		queryFn: async () => {
			const { data, error } = await api.v1.stacks.get();
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch stacks");
			if (!data) throw new Error("No data returned from API");
			return data;
		},
	});

	const filteredAndSortedStacks = useMemo(() => {
		if (!data) return [];

		let filtered = [...data];

		// Apply search filter
		if (search) {
			const searchLower = search.toLowerCase();
			filtered = filtered.filter(
				(stack) =>
					stack.name.toLowerCase().includes(searchLower) ||
					stack.slug.toLowerCase().includes(searchLower) ||
					stack.description?.toLowerCase().includes(searchLower),
			);
		}

		// Apply sorting
		filtered.sort((a, b) => {
			let comparison = 0;
			switch (sortBy) {
				case "name":
					comparison = a.name.localeCompare(b.name);
					break;
				case "slug":
					comparison = a.slug.localeCompare(b.slug);
					break;
				case "weight":
					comparison = (a.weight ?? 0) - (b.weight ?? 0);
					break;
				case "createdAt":
					comparison =
						new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
					break;
			}
			return sortOrder === "asc" ? comparison : -comparison;
		});

		return filtered;
	}, [data, search, sortBy, sortOrder]);

	const toggleSort = (column: StackSortColumn) => {
		if (sortBy === column) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortBy(column);
			setSortOrder("asc");
		}
	};

	const SortButton = ({ column }: { column: StackSortColumn }) => {
		const isActive = sortBy === column;
		return (
			<Button
				variant="ghost"
				size="sm"
				className="h-8 gap-1"
				onClick={() => toggleSort(column)}
			>
				{isActive ? (
					sortOrder === "asc" ? (
						<ArrowUp className="h-4 w-4" />
					) : (
						<ArrowDown className="h-4 w-4" />
					)
				) : (
					<ArrowUpDown className="h-4 w-4 opacity-50" />
				)}
			</Button>
		);
	};

	return (
		<div className="flex flex-1 flex-col gap-4">
			<div className="flex items-center gap-2">
				<div className="relative max-w-sm flex-1">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
					<Input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search stacks..."
						className="pr-9 pl-9"
					/>
					{search && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSearch("")}
							className="-translate-y-1/2 absolute top-1/2 right-1 h-7 w-7 p-0"
						>
							<X className="h-4 w-4" />
							<span className="sr-only">Clear search</span>
						</Button>
					)}
				</div>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[100px]">
								<div className="flex items-center gap-2">
									<span>Name</span>
									<SortButton column="name" />
								</div>
							</TableHead>
							<TableHead>
								<div className="flex items-center gap-2">
									<span>Slug</span>
									<SortButton column="slug" />
								</div>
							</TableHead>
							<TableHead className="w-[100px]">
								<div className="flex items-center gap-2">
									<span>Weight</span>
									<SortButton column="weight" />
								</div>
							</TableHead>
							<TableHead className="w-[200px]">
								<div className="flex items-center gap-2">
									<span>Created</span>
									<SortButton column="createdAt" />
								</div>
							</TableHead>
							<TableHead className="w-[100px]">Description</TableHead>
							<TableHead className="w-[100px]">Icon</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading && (
							<TableRow>
								<TableCell colSpan={6} className="h-24 text-center">
									<div className="flex items-center justify-center gap-2">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span className="text-muted-foreground">
											Loading stacks...
										</span>
									</div>
								</TableCell>
							</TableRow>
						)}

						{isError && (
							<TableRow>
								<TableCell
									colSpan={6}
									className="h-24 text-center text-destructive"
								>
									Failed to load stacks. Please try again.
								</TableCell>
							</TableRow>
						)}

						{!isLoading && !isError && filteredAndSortedStacks.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={6}
									className="h-24 text-center text-muted-foreground"
								>
									No stacks found.
								</TableCell>
							</TableRow>
						)}

						{!isLoading &&
							!isError &&
							filteredAndSortedStacks.map((stack) => (
								<TableRow key={stack.id}>
									<TableCell className="font-medium">{stack.name}</TableCell>
									<TableCell className="font-mono text-muted-foreground text-sm">
										{stack.slug}
									</TableCell>
									<TableCell>{stack.weight ?? 0}</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{new Date(stack.createdAt).toLocaleDateString()}
									</TableCell>
									<TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
										{stack.description || "-"}
									</TableCell>
									<TableCell className="font-mono text-muted-foreground text-xs">
										{stack.icon || "-"}
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
