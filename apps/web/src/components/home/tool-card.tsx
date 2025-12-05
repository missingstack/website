import type {
	Tag,
	ToolData,
	ToolWithSponsorship,
} from "@missingstack/api/types";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { formatPricingDisplay } from "~/lib/utils";

// Shared utility function
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

// ToolCard Component (Default)
interface ToolCardProps {
	tool: ToolData;
	tags?: Tag[];
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

// ToolCardGrid Component
interface ToolCardGridProps {
	tool: ToolData | ToolWithSponsorship;
}

export function ToolCardGrid({ tool }: ToolCardGridProps) {
	return (
		<Link
			href={`/tools/${tool.slug}`}
			className="group hover:-translate-y-1 relative flex h-full flex-col rounded-xl border border-border/50 bg-white p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98] sm:rounded-2xl sm:p-5 lg:p-6"
		>
			<div className="mb-4 flex items-start gap-4">
				<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-secondary/50 transition-colors group-hover:border-primary/20">
					<Image
						src={tool.logo}
						alt={tool.name}
						fill
						className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
						sizes="48px"
						unoptimized
					/>
				</div>
				<div className="min-w-0 flex-1">
					<h3 className="font-medium text-lg text-primary leading-tight transition-colors group-hover:text-blue-600">
						{tool.name}
					</h3>
					<p className="mt-1 font-medium text-muted-foreground/80 text-xs uppercase tracking-wide">
						{tool.tagline}
					</p>
				</div>
			</div>

			<p className="mb-6 line-clamp-2 flex-1 text-muted-foreground/80 text-sm leading-relaxed">
				{tool.description}
			</p>

			<div className="mt-auto flex items-center justify-between border-border/50 border-t border-dashed pt-4">
				<div className="flex flex-wrap gap-2">
					{tool.isSponsored && (
						<Badge variant="gold" className="px-1.5 py-0.5 text-[9px]">
							Sponsored
						</Badge>
					)}
					<Badge
						variant={tool.pricing === "free" ? "green" : "blue"}
						className="text-xs"
					>
						{formatPricingDisplay(tool.pricing)}
					</Badge>
				</div>
				<div className="flex translate-x-2 transform items-center gap-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
					<span className="font-medium text-muted-foreground text-xs group-hover:text-primary">
						Visit
					</span>
					<div className="rounded-lg bg-primary/10 p-1.5 transition-colors group-hover:bg-primary/20">
						<ExternalLink className="h-4 w-4 text-primary" />
					</div>
				</div>
			</div>
		</Link>
	);
}

// ToolCardLarge Component
interface ToolCardLargeProps {
	tool: ToolData | ToolWithSponsorship;
}

export function ToolCardLarge({ tool }: ToolCardLargeProps) {
	return (
		<Link
			href={`/tools/${tool.slug}`}
			className="group hover:-translate-y-1 relative flex h-full flex-col rounded-xl border-2 border-border/50 bg-white p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-primary/10 hover:shadow-xl active:scale-[0.98] sm:rounded-2xl sm:p-6 lg:p-8"
		>
			<div className="mb-4 flex items-start gap-5">
				<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-border/50 bg-secondary/50 transition-colors group-hover:border-primary/30">
					<Image
						src={tool.logo}
						alt={tool.name}
						fill
						className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
						sizes="64px"
						unoptimized
					/>
				</div>
				<div className="min-w-0 flex-1">
					<h3 className="mb-1 font-semibold text-primary text-xl transition-colors group-hover:text-blue-600">
						{tool.name}
					</h3>
					<p className="font-medium text-muted-foreground/80 text-sm uppercase tracking-wide">
						{tool.tagline}
					</p>
				</div>
			</div>

			<p className="mb-6 line-clamp-3 flex-1 text-base text-muted-foreground/90 leading-relaxed">
				{tool.description}
			</p>

			<div className="mt-auto flex items-center justify-between border-border/50 border-t border-dashed pt-5">
				<div className="flex flex-wrap gap-2">
					{tool.isSponsored && (
						<Badge variant="gold" className="px-2 py-0.5 text-[10px]">
							Sponsored
						</Badge>
					)}
					<Badge variant={tool.pricing === "free" ? "green" : "blue"}>
						{formatPricingDisplay(tool.pricing)}
					</Badge>
				</div>
				<div className="flex translate-x-2 transform items-center gap-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
					<span className="font-medium text-muted-foreground text-xs group-hover:text-primary">
						Visit
					</span>
					<div className="rounded-lg bg-primary/10 p-1.5 transition-colors group-hover:bg-primary/20">
						<ExternalLink className="h-4 w-4 text-primary" />
					</div>
				</div>
			</div>
		</Link>
	);
}

// ToolCardSkeleton Component
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
