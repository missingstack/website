"use client";

import type { ToolData } from "@missingstack/api/types";
import { ExternalLink } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { formatPricingDisplay } from "~/lib/utils";

interface ToolDetailDetailsProps {
	tool: ToolData;
}

export function ToolDetailDetails({ tool }: ToolDetailDetailsProps) {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Tool Details</CardTitle>
					<CardDescription>Complete information about the tool</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-1">
							<div className="font-medium text-muted-foreground text-sm">
								Slug
							</div>
							<p className="font-mono text-sm">{tool.slug}</p>
						</div>
						<div className="space-y-1">
							<div className="font-medium text-muted-foreground text-sm">
								ID
							</div>
							<p className="font-mono text-sm">{tool.id}</p>
						</div>
						<div className="space-y-1">
							<div className="font-medium text-muted-foreground text-sm">
								Name
							</div>
							<p className="text-sm">{tool.name}</p>
						</div>
						<div className="space-y-1">
							<div className="font-medium text-muted-foreground text-sm">
								Tagline
							</div>
							<p className="text-sm">{tool.tagline || "-"}</p>
						</div>
						<div className="space-y-1">
							<div className="font-medium text-muted-foreground text-sm">
								Pricing Model
							</div>
							<p className="text-sm">{formatPricingDisplay(tool.pricing)}</p>
						</div>
						<div className="space-y-1">
							<div className="font-medium text-muted-foreground text-sm">
								License
							</div>
							<p className="text-sm">{tool.license || "-"}</p>
						</div>
						<div className="space-y-1">
							<div className="font-medium text-muted-foreground text-sm">
								Website
							</div>
							{tool.website ? (
								<a
									href={tool.website}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1 text-primary text-sm hover:underline"
								>
									{tool.website}
									<ExternalLink className="h-3 w-3" />
								</a>
							) : (
								<p className="text-sm">-</p>
							)}
						</div>
						<div className="space-y-1">
							<div className="font-medium text-muted-foreground text-sm">
								Logo URL
							</div>
							{tool.logo ? (
								<a
									href={tool.logo}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1 text-primary text-sm hover:underline"
								>
									{tool.logo}
									<ExternalLink className="h-3 w-3" />
								</a>
							) : (
								<p className="text-sm">-</p>
							)}
						</div>
						<div className="space-y-1">
							<div className="font-medium text-muted-foreground text-sm">
								Featured
							</div>
							<p className="text-sm">{tool.featured ? "Yes" : "No"}</p>
						</div>
						<div className="space-y-1">
							<div className="font-medium text-muted-foreground text-sm">
								Sponsored
							</div>
							<p className="text-sm">{tool.isSponsored ? "Yes" : "No"}</p>
						</div>
						<div className="space-y-1">
							<div className="font-medium text-muted-foreground text-sm">
								Created At
							</div>
							<p className="text-sm">
								{new Date(tool.createdAt).toLocaleString()}
							</p>
						</div>
						<div className="space-y-1">
							<div className="font-medium text-muted-foreground text-sm">
								Updated At
							</div>
							<p className="text-sm">
								{new Date(tool.updatedAt).toLocaleString()}
							</p>
						</div>
					</div>

					<Separator />

					<div className="space-y-2">
						<div className="font-medium text-muted-foreground text-sm">
							Description
						</div>
						<p className="whitespace-pre-wrap text-muted-foreground text-sm">
							{tool.description || "No description available."}
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
