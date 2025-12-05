import type { ToolData, ToolWithSponsorship } from "@missingstack/api/types";
import { ToolCardGrid, ToolCardLarge } from "../tool-card";

interface ToolGridProps {
	tools: ToolData[] | ToolWithSponsorship[];
	layout?: "grid" | "large";
}

export function ToolGrid({ tools, layout = "grid" }: ToolGridProps) {
	if (tools.length === 0) return null;

	const isLargeLayout = layout === "large";

	if (isLargeLayout) {
		return (
			<div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
				{tools.slice(0, 2).map((tool) => (
					<ToolCardLarge key={tool.id} tool={tool} />
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
			{tools.map((tool) => (
				<ToolCardGrid key={tool.id} tool={tool} />
			))}
		</div>
	);
}
