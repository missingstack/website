"use client";

import type { ToolData } from "@missingstack/api/types";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { useRelatedStacks } from "~/hooks/tools/use-related-data";
import { EmptyStateCard, LoadingSkeleton } from "../shared";

interface ToolDetailStacksProps {
	tool: ToolData;
}

export function ToolDetailStacks({ tool }: ToolDetailStacksProps) {
	const { data: stacks, isLoading } = useRelatedStacks(tool.stackIds);

	if (tool.stackIds.length === 0) {
		return <EmptyStateCard message="No stacks assigned" />;
	}

	if (isLoading) {
		return <LoadingSkeleton />;
	}

	return (
		<div className="space-y-4">
			{(stacks || []).map((stack) => (
				<Card key={stack?.id}>
					<CardHeader>
						<CardTitle className="text-lg">{stack?.name}</CardTitle>
						{stack?.description && (
							<CardDescription>{stack.description}</CardDescription>
						)}
					</CardHeader>
				</Card>
			))}
		</div>
	);
}
