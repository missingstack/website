"use client";

import type { ToolData } from "@missingstack/api/types";
import {
	ToolDetailAlternatives,
	ToolDetailCategories,
	ToolDetailDetails,
	ToolDetailOverview,
	ToolDetailStacks,
	ToolDetailTags,
} from "./views";

export type ToolDetailView =
	| "overview"
	| "details"
	| "categories"
	| "tags"
	| "stacks"
	| "alternatives";

interface ToolDetailContentProps {
	tool: ToolData;
	view: ToolDetailView;
}

const viewComponents: Record<
	ToolDetailView,
	({ tool }: { tool: ToolData }) => React.JSX.Element
> = {
	overview: ToolDetailOverview,
	details: ToolDetailDetails,
	categories: ToolDetailCategories,
	tags: ToolDetailTags,
	stacks: ToolDetailStacks,
	alternatives: ToolDetailAlternatives,
};

export function ToolDetailContent({ tool, view }: ToolDetailContentProps) {
	const ViewComponent = viewComponents[view];
	if (!ViewComponent) return null;

	return <ViewComponent tool={tool} />;
}
