import {
	createSearchParamsCache,
	parseAsArrayOf,
	parseAsString,
	parseAsStringLiteral,
} from "nuqs/server";

// Define sort options
export const sortOptions = ["newest", "name", "popular"] as const;
export type SortOption = (typeof sortOptions)[number];

// Define the search params parsers
export const searchParamsParsers = {
	search: parseAsString.withDefault(""),
	sortBy: parseAsStringLiteral(sortOptions).withDefault("newest"),
	categoryIds: parseAsArrayOf(parseAsString).withDefault([]),
	pricing: parseAsArrayOf(parseAsString).withDefault([]),
	platforms: parseAsArrayOf(parseAsString).withDefault([]),
	tagIds: parseAsArrayOf(parseAsString).withDefault([]),
};

// Create a cache for server components
export const searchParamsCache = createSearchParamsCache(searchParamsParsers);

// Pricing options
export const PRICING_OPTIONS = [
	"Free",
	"Freemium",
	"Paid",
	"Open Source",
	"Enterprise",
] as const;

// Platform options
export const PLATFORM_OPTIONS = [
	"Web",
	"Mac",
	"Windows",
	"Linux",
	"iOS",
	"Android",
	"API",
] as const;

// Sort options with labels
export const SORT_OPTIONS = [
	{ value: "newest" as const, label: "Newest First" },
	{ value: "name" as const, label: "Alphabetical" },
	{ value: "popular" as const, label: "Most Popular" },
];
