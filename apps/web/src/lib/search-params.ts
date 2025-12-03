import {
	PLATFORM_OPTIONS,
	PRICING_OPTIONS,
} from "@missingstack/api/constants/enums";
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

// Re-export enum options from API package
export { PLATFORM_OPTIONS, PRICING_OPTIONS };

// Sort options with labels
export const SORT_OPTIONS = [
	{ value: "newest" as const, label: "Newest First" },
	{ value: "name" as const, label: "Alphabetical" },
	{ value: "popular" as const, label: "Most Popular" },
];
