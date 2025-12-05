"use client";

import type { StackWithCount, ToolData } from "@missingstack/api/types";
import { useMemo, useState } from "react";
import { StacksEmptyState } from "./stacks-empty-state";
import { StacksFeatured } from "./stacks-featured";
import { StacksGrid } from "./stacks-grid";
import { StacksSearch } from "./stacks-search";

interface StacksContentProps {
	stacks: StackWithCount[];
	stackToolPreviews: { stack: StackWithCount; tools: ToolData[] }[];
}

export function StacksContent({
	stacks,
	stackToolPreviews,
}: StacksContentProps) {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredStacks = useMemo(() => {
		if (!searchQuery.trim()) {
			return stacks;
		}

		const query = searchQuery.toLowerCase();
		return stacks.filter(
			(stack) =>
				stack.name.toLowerCase().includes(query) ||
				stack.description?.toLowerCase().includes(query),
		);
	}, [stacks, searchQuery]);

	const filteredStackPreviews = useMemo(() => {
		if (!searchQuery.trim()) {
			return stackToolPreviews;
		}

		const query = searchQuery.toLowerCase();
		return stackToolPreviews.filter(
			({ stack }) =>
				stack.name.toLowerCase().includes(query) ||
				stack.description?.toLowerCase().includes(query),
		);
	}, [stackToolPreviews, searchQuery]);

	const hasSearchQuery = searchQuery.trim().length > 0;

	return (
		<>
			<StacksSearch
				value={searchQuery}
				onChange={setSearchQuery}
				resultCount={hasSearchQuery ? filteredStacks.length : undefined}
			/>

			{(!hasSearchQuery || filteredStackPreviews.length > 0) && (
				<StacksFeatured
					stacks={filteredStackPreviews}
					hasSearchQuery={hasSearchQuery}
				/>
			)}

			{(!hasSearchQuery || filteredStacks.length > 0) &&
				(filteredStacks.length === 0 ? (
					<StacksEmptyState
						searchQuery={searchQuery}
						onClearSearch={() => setSearchQuery("")}
					/>
				) : (
					<StacksGrid
						stacks={filteredStacks}
						hasSearchQuery={hasSearchQuery}
						totalStacks={stacks.length}
					/>
				))}
		</>
	);
}
