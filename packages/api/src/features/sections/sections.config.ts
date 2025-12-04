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
		id: "web-analytics",
		type: "category",
		filter: null,
		categoryId: "web-analytics",
		title: "Web Analytics",
		description: "",
		icon: "Globe",
		iconColor: "blue",
		limit: 3,
		layout: "grid",
		enabled: true,
		weight: 2,
	},
	{
		id: "product-analytics",
		type: "category",
		filter: null,
		categoryId: "product-analytics",
		title: "Product Analytics",
		description: "Product analytics, monitoring, and metrics",
		icon: "Package",
		iconColor: "amber",
		limit: 3,
		layout: "grid",
		enabled: true,
		weight: 3,
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
];

export function getEnabledSections(): Section[] {
	return sections
		.filter((s: Section) => s.enabled)
		.sort((a: Section, b: Section) => (a.weight ?? 0) - (b.weight ?? 0));
}
