"use client";

import type { ToolData } from "@missingstack/api/types";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { useRelatedCategories } from "~/hooks/tools/use-related-data";
import { EmptyStateCard, LoadingSkeleton } from "../shared";

interface ToolDetailCategoriesProps {
	tool: ToolData;
}

export function ToolDetailCategories({ tool }: ToolDetailCategoriesProps) {
	const { data: categories, isLoading } = useRelatedCategories(
		tool.categoryIds,
	);

	if (tool.categoryIds.length === 0) {
		return <EmptyStateCard message="No categories assigned" />;
	}

	if (isLoading) {
		return <LoadingSkeleton />;
	}

	return (
		<div className="space-y-4">
			{(categories || []).map((category) => (
				<Card key={category?.id}>
					<CardHeader>
						<CardTitle className="text-lg">{category?.name}</CardTitle>
						{category?.description && (
							<CardDescription>{category.description}</CardDescription>
						)}
					</CardHeader>
				</Card>
			))}
		</div>
	);
}
