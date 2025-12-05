"use client";

import type { ToolData } from "@missingstack/api/types";
import { ExternalLink, Globe } from "lucide-react";
import Image from "next/image";
import { Badge } from "~/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { formatPricingDisplay } from "~/lib/utils";

interface ToolInfoCardProps {
	tool: ToolData;
}

export function ToolInfoCard({ tool }: ToolInfoCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Tool Information</CardTitle>
				<CardDescription>Basic information about the tool</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-start gap-4">
					{tool.logo && (
						<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border">
							<Image
								src={tool.logo}
								alt={tool.name}
								fill
								className="object-contain p-2"
							/>
						</div>
					)}
					<div className="flex-1 space-y-2">
						<div>
							<h3 className="font-semibold text-lg">{tool.name}</h3>
							{tool.tagline && (
								<p className="text-muted-foreground text-sm">{tool.tagline}</p>
							)}
						</div>
						<div className="flex flex-wrap gap-2">
							<Badge variant="outline">
								{formatPricingDisplay(tool.pricing)}
							</Badge>
							{tool.license && <Badge variant="outline">{tool.license}</Badge>}
							{tool.featured && <Badge variant="default">Featured</Badge>}
							{tool.isSponsored && <Badge variant="default">Sponsored</Badge>}
						</div>
					</div>
				</div>

				<Separator />

				<div className="space-y-2">
					<h4 className="font-medium text-sm">Description</h4>
					<p className="whitespace-pre-wrap text-muted-foreground text-sm">
						{tool.description || "No description available."}
					</p>
				</div>

				{tool.website && (
					<>
						<Separator />
						<div className="flex items-center gap-2">
							<Globe className="h-4 w-4 text-muted-foreground" />
							<a
								href={tool.website}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1 text-primary text-sm hover:underline"
							>
								{tool.website}
								<ExternalLink className="h-3 w-3" />
							</a>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
