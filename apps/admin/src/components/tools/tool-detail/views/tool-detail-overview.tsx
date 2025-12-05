"use client";

import type { ToolData } from "@missingstack/api/types";
import { ToolInfoCard, ToolStatCard } from "../shared";

interface ToolDetailOverviewProps {
	tool: ToolData;
}

export function ToolDetailOverview({ tool }: ToolDetailOverviewProps) {
	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-3">
				<ToolStatCard title="Categories" value={tool.categoryIds.length} />
				<ToolStatCard title="Tags" value={tool.tagIds.length} />
				<ToolStatCard title="Alternatives" value={tool.alternativeIds.length} />
			</div>
			<ToolInfoCard tool={tool} />
		</div>
	);
}
