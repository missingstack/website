import type { Section, Tool, ToolData } from "@missingstack/api/types";
import {
	ArrowRight,
	BarChart3,
	Box,
	Briefcase,
	Clock,
	Cloud,
	Code2,
	Database,
	ExternalLink,
	FileText,
	Flame,
	Globe,
	Megaphone,
	Palette,
	ShieldCheck,
	Smartphone,
	Sparkles,
	TrendingUp,
	Workflow,
} from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";

// IconColor type - matches the enum from @missingstack/db/schema/enums
type IconColor =
	| "emerald"
	| "orange"
	| "blue"
	| "purple"
	| "pink"
	| "green"
	| "cyan"
	| "amber"
	| "slate"
	| "red"
	| "yellow"
	| "indigo"
	| "teal";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
	Flame,
	TrendingUp,
	Clock,
	Code2,
	Sparkles,
	Palette,
	Cloud,
	FileText,
	Database,
	Globe,
	Smartphone,
	BarChart3,
	Briefcase,
	Box,
	Megaphone,
	ShieldCheck,
	Workflow,
};

// Color mapping for icons
const colorMap: Record<IconColor, { text: string; bg: string }> = {
	orange: { text: "text-orange-500", bg: "bg-orange-50" },
	blue: { text: "text-blue-500", bg: "bg-blue-50" },
	purple: { text: "text-purple-500", bg: "bg-purple-50" },
	pink: { text: "text-pink-500", bg: "bg-pink-50" },
	green: { text: "text-green-500", bg: "bg-green-50" },
	cyan: { text: "text-cyan-500", bg: "bg-cyan-50" },
	amber: { text: "text-amber-500", bg: "bg-amber-50" },
	emerald: { text: "text-emerald-500", bg: "bg-emerald-50" },
	red: { text: "text-red-500", bg: "bg-red-50" },
	slate: { text: "text-slate-500", bg: "bg-slate-50" },
	yellow: { text: "text-yellow-500", bg: "bg-yellow-50" },
	indigo: { text: "text-indigo-500", bg: "bg-indigo-50" },
	teal: { text: "text-teal-500", bg: "bg-teal-50" },
};

interface ConfigurableSectionProps {
	config: Section;
	tools: ToolData[] | Tool[];
}

function getViewAllLink(config: Section): Route {
	if (config.type === "category" && config.categoryId) {
		return `/categories/${config.categoryId}` as Route;
	}
	return "/discover" as Route;
}

/**
 * ConfigurableSection - Renders a homepage section with pre-fetched tools
 *
 * NOTE: This is a regular (non-async) component. Tools are fetched in parallel
 * by the parent HomepageSections component and passed as props.
 */
export function ConfigurableSection({
	config,
	tools,
}: ConfigurableSectionProps) {
	if (tools.length === 0) return null;

	const Icon = iconMap[config.icon] || Flame;
	const colors = colorMap[config.iconColor ?? "blue"] || colorMap.blue;
	const viewAllLink = getViewAllLink(config);

	// Determine layout from config (defaults to "grid" if not specified)
	const layout = config.layout || "grid";
	const isLargeLayout = layout === "large";

	return (
		<section className="border-border/50 border-b py-8 last:border-b-0 sm:py-10 lg:py-12">
			<div className="mx-auto max-w-7xl px-4 sm:px-6">
				<div className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center sm:gap-6 lg:mb-10">
					<div className="flex items-center gap-3 sm:gap-4">
						<div
							className={`p-2.5 ${colors.bg} rounded-lg transition-transform duration-200 hover:scale-110 sm:rounded-xl sm:p-3`}
						>
							<Icon className={`h-5 w-5 ${colors.text} sm:h-6 sm:w-6`} />
						</div>
						<div>
							<h2 className="mb-1 font-bold font-serif text-primary text-xl leading-tight sm:text-2xl md:text-3xl">
								{config.title}
							</h2>
							<p className="text-muted-foreground/80 text-xs sm:text-sm">
								{config.description}
							</p>
						</div>
					</div>

					<Link
						href={viewAllLink}
						className="flex min-h-[44px] items-center gap-1.5 font-medium text-primary text-xs transition-all duration-200 hover:gap-2 hover:underline active:scale-95 sm:text-sm"
					>
						View all
						<ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 sm:h-4 sm:w-4" />
					</Link>
				</div>

				{/* Large layout: Large horizontal cards */}
				{isLargeLayout && tools.length > 0 && (
					<div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
						{tools.slice(0, 2).map((tool) => (
							<Link
								key={tool.id}
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
										<h3 className="mb-1 font-semibold font-serif text-primary text-xl transition-colors group-hover:text-blue-600">
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
										<Badge variant={tool.pricing === "Free" ? "green" : "blue"}>
											{tool.pricing}
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
						))}
					</div>
				)}

				{/* Grid layout: Standard grid */}
				{!isLargeLayout && tools.length > 0 && (
					<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
						{tools.map((tool) => (
							<Link
								key={tool.id}
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
										<h3 className="font-medium font-serif text-lg text-primary leading-tight transition-colors group-hover:text-blue-600">
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
										<Badge
											variant={tool.pricing === "Free" ? "green" : "blue"}
											className="text-xs"
										>
											{tool.pricing}
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
						))}
					</div>
				)}
			</div>
		</section>
	);
}
