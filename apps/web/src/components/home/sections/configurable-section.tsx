import type {
	Section,
	ToolData,
	ToolWithSponsorship,
} from "@missingstack/api/types";
import { SectionHeader } from "./section-header";
import { ToolGrid } from "./tool-grid";

interface ConfigurableSectionProps {
	config: Section;
	tools: ToolData[] | ToolWithSponsorship[];
}

export function ConfigurableSection({
	config,
	tools,
}: ConfigurableSectionProps) {
	if (tools.length === 0) return null;

	const layout = config.layout || "grid";
	// Map carousel to grid for now (carousel layout not yet implemented)
	const gridLayout: "grid" | "large" =
		layout === "carousel" ? "grid" : layout === "large" ? "large" : "grid";

	return (
		<section className="border-border/50 border-b py-8 last:border-b-0 sm:py-10 lg:py-12">
			<div className="mx-auto max-w-7xl px-4 sm:px-6">
				<SectionHeader config={config} />
				<ToolGrid tools={tools} layout={gridLayout} />
			</div>
		</section>
	);
}
