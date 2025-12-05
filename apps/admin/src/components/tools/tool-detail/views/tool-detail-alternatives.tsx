"use client";

import type { ToolData } from "@missingstack/api/types";
import Image from "next/image";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { useRelatedTools } from "~/hooks/tools/use-related-data";
import { EmptyStateCard, LoadingSkeleton } from "../shared";

interface ToolDetailAlternativesProps {
	tool: ToolData;
}

export function ToolDetailAlternatives({ tool }: ToolDetailAlternativesProps) {
	const { data: alternatives, isLoading } = useRelatedTools(
		tool.alternativeIds,
	);

	if (tool.alternativeIds.length === 0) {
		return <EmptyStateCard message="No alternatives assigned" />;
	}

	if (isLoading) {
		return <LoadingSkeleton />;
	}

	return (
		<div className="space-y-4">
			{(alternatives || []).map((alternative) => (
				<Card key={alternative?.id}>
					<CardHeader>
						<div className="flex items-start gap-4">
							{alternative?.logo && (
								<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border">
									<Image
										src={alternative.logo}
										alt={alternative.name}
										fill
										className="object-contain p-1"
									/>
								</div>
							)}
							<div className="flex-1">
								<CardTitle className="text-lg">{alternative?.name}</CardTitle>
								{alternative?.tagline && (
									<CardDescription>{alternative.tagline}</CardDescription>
								)}
							</div>
						</div>
					</CardHeader>
				</Card>
			))}
		</div>
	);
}
