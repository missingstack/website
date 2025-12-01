/**
 * Homepage Sections Configuration
 *
 * Static configuration for homepage sections.
 * This is code-defined and doesn't require a database table.
 */
import type {
	IconColor,
	SectionFilter,
	SectionLayout,
	SectionType,
} from "@missingstack/db/schema/enums";

export type Section = {
	id: string;
	type: SectionType;
	filter: SectionFilter | null;
	categoryId: string | null;
	title: string;
	description: string | null;
	icon: string;
	iconColor: IconColor | null;
	limit: number | null;
	layout: SectionLayout | null;
	enabled: boolean | null;
	weight: number | null;
};

export const sections: Section[] = [
	{
		id: "featured",
		type: "filter",
		filter: "featured",
		categoryId: null,
		title: "Featured Tools",
		description: "Hand-picked by our team for quality and usefulness",
		icon: "Flame",
		iconColor: "orange",
		limit: 6,
		layout: "large",
		enabled: true,
		weight: 0,
	},
	{
		id: "newest",
		type: "filter",
		filter: "newest",
		categoryId: null,
		title: "Recently Added",
		description: "Fresh tools added to the platform",
		icon: "Clock",
		iconColor: "emerald",
		limit: 4,
		layout: "grid",
		enabled: true,
		weight: 1,
	},

	{
		id: "dev-tools",
		type: "category",
		filter: null,
		categoryId: "developer-tools",
		title: "Developer Tools",
		description: "Code editors, debugging, and development utilities",
		icon: "Code2",
		iconColor: "blue",
		limit: 3,
		layout: "grid",
		enabled: true,
		weight: 2,
	},
	{
		id: "database-tools",
		type: "category",
		filter: null,
		categoryId: "database",
		title: "Data & Databases",
		description: "Databases, data storage, and analytics",
		icon: "Database",
		iconColor: "purple",
		limit: 3,
		layout: "grid",
		enabled: true,
		weight: 3,
	},
	{
		id: "security-tools",
		type: "category",
		filter: null,
		categoryId: "security",
		title: "Security",
		description: "Cybersecurity, auth, and password management",
		icon: "ShieldCheck",
		iconColor: "pink",
		limit: 3,
		layout: "grid",
		enabled: true,
		weight: 4,
	},
	{
		id: "popular",
		type: "filter",
		filter: "popular",
		categoryId: null,
		title: "Popular Tools",
		description: "Most loved by the community",
		icon: "TrendingUp",
		iconColor: "green",
		limit: 6,
		layout: "large",
		enabled: false,
		weight: 5,
	},
	{
		id: "automation-tools",
		type: "category",
		filter: null,
		categoryId: "automation",
		title: "Automation",
		description: "Workflow automation and internal tools",
		icon: "Workflow",
		iconColor: "cyan",
		limit: 3,
		layout: "grid",
		enabled: false,
		weight: 6,
	},
	{
		id: "analytics-tools",
		type: "category",
		filter: null,
		categoryId: "analytics-observability",
		title: "Analytics & Observability",
		description: "Product analytics, monitoring, and metrics",
		icon: "BarChart3",
		iconColor: "amber",
		limit: 3,
		layout: "grid",
		enabled: false,
		weight: 7,
	},
	{
		id: "business-tools",
		type: "category",
		filter: null,
		categoryId: "business-tools",
		title: "Business Tools",
		description: "CRM, finance, and customer engagement",
		icon: "Briefcase",
		iconColor: "slate",
		limit: 3,
		layout: "grid",
		enabled: false,
		weight: 8,
	},
];

export function getEnabledSections(): Section[] {
	return sections
		.filter((s: Section) => s.enabled)
		.sort((a: Section, b: Section) => (a.weight ?? 0) - (b.weight ?? 0));
}
