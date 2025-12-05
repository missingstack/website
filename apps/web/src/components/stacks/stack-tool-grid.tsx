"use client";

import type { ToolData } from "@missingstack/api/types";
import { ToolCard, ToolCardSkeleton } from "~/components/home/tool-card";

interface StackToolGridProps {
	tools: ToolData[];
	isLoading?: boolean;
}

export function StackToolGrid({ tools, isLoading }: StackToolGridProps) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{Array.from({ length: 6 }).map((_, i) => (
					<ToolCardSkeleton key={`skeleton-${i.toString()}`} />
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
			{tools.map((tool) => (
				<ToolCard key={tool.id} tool={tool} />
			))}
		</div>
	);
}
