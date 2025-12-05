"use client";

import type { ToolData } from "@missingstack/api/types";
import { Tag } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { useRelatedTags } from "~/hooks/tools/use-related-data";
import { EmptyStateCard } from "../shared";

interface ToolDetailTagsProps {
	tool: ToolData;
}

export function ToolDetailTags({ tool }: ToolDetailTagsProps) {
	const { data: tags, isLoading } = useRelatedTags(tool.tagIds);

	const skeletonKeys = useMemo(
		() =>
			Array.from({ length: 5 }, (_, i) => `tag-skeleton-${Date.now()}-${i}`),
		[],
	);

	if (tool.tagIds.length === 0) {
		return <EmptyStateCard message="No tags assigned" />;
	}

	if (isLoading) {
		return (
			<div className="flex flex-wrap gap-2">
				{skeletonKeys.map((key) => (
					<Skeleton key={key} className="h-6 w-20" />
				))}
			</div>
		);
	}

	return (
		<div className="flex flex-wrap gap-2">
			{(tags || []).map((tag) => (
				<Badge key={tag?.id} variant="outline" className="gap-1">
					<Tag className="h-3 w-3" />
					{tag?.name}
				</Badge>
			))}
		</div>
	);
}
