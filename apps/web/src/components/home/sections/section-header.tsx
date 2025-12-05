import type { Section } from "@missingstack/api/types";
import {
	ArrowRight,
	BarChart3,
	Box,
	Briefcase,
	Clock,
	Cloud,
	Code2,
	Database,
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
import Link from "next/link";

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

function getViewAllLink(config: Section): Route {
	if (config.type === "category" && config.categoryId) {
		return `/categories/${config.categoryId}` as Route;
	}
	return "/discover" as Route;
}

interface SectionHeaderProps {
	config: Section;
}

export function SectionHeader({ config }: SectionHeaderProps) {
	const Icon = iconMap[config.icon] || Flame;
	const colors = colorMap[config.iconColor ?? "blue"] || colorMap.blue;
	const viewAllLink = getViewAllLink(config);

	return (
		<div className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center sm:gap-6 lg:mb-10">
			<div className="flex items-center gap-3 sm:gap-4">
				<div
					className={`p-2.5 ${colors.bg} rounded-lg transition-transform duration-200 hover:scale-110 sm:rounded-xl sm:p-3`}
				>
					<Icon className={`h-5 w-5 ${colors.text} sm:h-6 sm:w-6`} />
				</div>
				<div>
					<h2 className="mb-1 font-bold text-primary text-xl leading-tight sm:text-2xl md:text-3xl">
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
	);
}
