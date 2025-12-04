import type { Tag, ToolData } from "@missingstack/api/types";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { formatPricingDisplay } from "~/lib/utils";

interface ToolCardProps {
	tool: ToolData;
	tags?: Tag[];
}

function getBadgeVariant(
	pricing: string,
): "blue" | "green" | "purple" | "gold" | "default" {
	const lower = pricing.toLowerCase();
	if (lower === "free") return "green";
	if (lower === "freemium") return "blue";
	if (lower === "open-source") return "purple";
	if (lower === "paid" || lower === "enterprise") return "gold";
	return "default";
}

export function ToolCard({ tool }: ToolCardProps) {
	return (
		<Link
			href={`/tools/${tool.slug}`}
			className="group hover:-translate-y-1 relative flex h-full flex-col rounded-2xl border border-border/50 bg-white p-4 shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98] sm:p-5 lg:p-6"
		>
			<div className="mb-3 flex items-start justify-between sm:mb-4">
				<div className="flex min-w-0 items-center gap-3 sm:gap-4">
					<div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-secondary/50 transition-all duration-300 group-hover:scale-105 group-hover:border-primary/20 sm:h-12 sm:w-12">
						<Image
							src={tool.logo}
							alt={`${tool.name} logo`}
							fill
							className="object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
							sizes="48px"
							unoptimized
						/>
					</div>
					<div className="min-w-0 flex-1">
						<h3 className="font-medium text-base text-primary leading-tight transition-colors duration-200 group-hover:text-blue-600 sm:text-lg">
							{tool.name}
						</h3>
						<p className="mt-0.5 font-medium text-[10px] text-muted-foreground/80 uppercase tracking-wide sm:mt-1 sm:text-xs">
							{tool.tagline}
						</p>
					</div>
				</div>
			</div>

			<p className="mb-4 line-clamp-2 text-muted-foreground/80 text-xs leading-relaxed sm:mb-6 sm:text-sm">
				{tool.description}
			</p>

			<div className="mt-auto flex items-center justify-between border-border/50 border-t border-dashed pt-3 sm:pt-4">
				<div className="flex min-w-0 flex-wrap gap-1.5 sm:gap-2">
					{tool.isSponsored && (
						<Badge variant="gold" className="px-1.5 py-0.5 text-[9px]">
							Sponsored
						</Badge>
					)}
					<Badge
						variant={getBadgeVariant(tool.pricing)}
						className="text-[10px] sm:text-xs"
					>
						{formatPricingDisplay(tool.pricing)}
					</Badge>
				</div>

				<div className="flex shrink-0 translate-x-2 transform items-center justify-center opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
					<ExternalLink className="h-3.5 w-3.5 text-muted-foreground transition-colors duration-200 group-hover:text-primary sm:h-4 sm:w-4" />
				</div>
			</div>
		</Link>
	);
}

export function ToolCardSkeleton() {
	return (
		<div className="flex h-full flex-col rounded-2xl border border-border/50 bg-white p-6">
			<div className="mb-4 flex items-start justify-between">
				<div className="flex items-center gap-4">
					<Skeleton className="h-12 w-12 rounded-xl" />
					<div className="space-y-2">
						<Skeleton className="h-5 w-24" />
						<Skeleton className="h-3 w-16" />
					</div>
				</div>
				<Skeleton className="h-6 w-12 rounded-lg" />
			</div>
			<div className="mb-6 space-y-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-3/4" />
			</div>
			<div className="mt-auto border-border/50 border-t border-dashed pt-4">
				<div className="flex gap-2">
					<Skeleton className="h-6 w-16 rounded-full" />
					<Skeleton className="h-6 w-12 rounded-full" />
				</div>
			</div>
		</div>
	);
}
