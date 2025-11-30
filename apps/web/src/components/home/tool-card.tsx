import type { Tag, ToolData } from "@missingstack/api/types";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";

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
	if (lower === "open source") return "purple";
	if (lower === "paid" || lower === "enterprise") return "gold";
	return "default";
}

export function ToolCard({ tool }: ToolCardProps) {
	return (
		<Link
			href={`/tools/${tool.slug}`}
			className="group hover:-translate-y-1 relative flex h-full flex-col rounded-2xl border border-border/50 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-primary/5 hover:shadow-xl"
		>
			<div className="mb-4 flex items-start justify-between">
				<div className="flex items-center gap-4">
					<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-secondary/50 transition-colors group-hover:border-primary/20">
						<Image
							src={tool.logo}
							alt={`${tool.name} logo`}
							fill
							className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
							sizes="48px"
							unoptimized
						/>
					</div>
					<div>
						<h3 className="font-medium font-serif text-lg text-primary leading-tight transition-colors group-hover:text-blue-600">
							{tool.name}
						</h3>
						<p className="mt-1 font-medium text-muted-foreground/80 text-xs uppercase tracking-wide">
							{tool.tagline}
						</p>
					</div>
				</div>
			</div>

			<p className="mb-6 line-clamp-2 text-muted-foreground/80 text-sm leading-relaxed">
				{tool.description}
			</p>

			<div className="mt-auto flex items-center justify-between border-border/50 border-t border-dashed pt-4">
				<div className="flex flex-wrap gap-2">
					<Badge variant={getBadgeVariant(tool.pricing)}>{tool.pricing}</Badge>
					{tool.platforms?.slice(0, 1).map((platform) => (
						<Badge key={platform} variant="secondary">
							{platform}
						</Badge>
					))}
				</div>

				<div className="translate-x-2 transform opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
					<ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
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
