import {
	parseAsString as parseAsStringClient,
	parseAsStringLiteral as parseAsStringLiteralClient,
} from "nuqs";
import { parseAsString, parseAsStringLiteral } from "nuqs/server";

// Define sortable columns for admin categories
export const categorySortColumns = [
	"name",
	"slug",
	"weight",
	"createdAt",
] as const;
export type CategorySortColumn = (typeof categorySortColumns)[number];

// Define sortable columns for admin tools
export const toolSortColumns = ["name", "newest", "popular"] as const;
export type ToolSortColumn = (typeof toolSortColumns)[number];

// Define sortable columns for admin stacks
export const stackSortColumns = [
	"name",
	"slug",
	"weight",
	"createdAt",
] as const;
export type StackSortColumn = (typeof stackSortColumns)[number];

// Define sortable columns for admin tags
export const tagSortColumns = ["name", "slug", "createdAt"] as const;
export type TagSortColumn = (typeof tagSortColumns)[number];

// Define the search params parsers for admin (server-side)
// Note: parseAsString defaults to null (empty string means no search)
export const adminSearchParamsParsers = {
	search: parseAsString,
	sortBy: parseAsStringLiteral(categorySortColumns).withDefault("createdAt"),
	sortOrder: parseAsStringLiteral(["asc", "desc"] as const).withDefault("desc"),
	edit: parseAsString, // Category ID to edit, "new" for new category
};

// Client-side parsers for nuqs (used in client components)
export const adminSearchParamsParsersClient = {
	search: parseAsStringClient.withDefault(""),
	sortBy:
		parseAsStringLiteralClient(categorySortColumns).withDefault("createdAt"),
	sortOrder: parseAsStringLiteralClient(["asc", "desc"] as const).withDefault(
		"desc",
	),
	edit: parseAsStringClient, // Category ID to edit, "new" for new category
};

// Tools search params parsers
export const adminToolsSearchParamsParsersClient = {
	search: parseAsStringClient.withDefault(""),
	sortBy: parseAsStringLiteralClient(toolSortColumns).withDefault("newest"),
	sortOrder: parseAsStringLiteralClient(["asc", "desc"] as const).withDefault(
		"desc",
	),
};

// Stacks search params parsers
export const adminStacksSearchParamsParsersClient = {
	search: parseAsStringClient.withDefault(""),
	sortBy: parseAsStringLiteralClient(stackSortColumns).withDefault("createdAt"),
	sortOrder: parseAsStringLiteralClient(["asc", "desc"] as const).withDefault(
		"desc",
	),
};

// Tags search params parsers
export const adminTagsSearchParamsParsersClient = {
	search: parseAsStringClient.withDefault(""),
	sortBy: parseAsStringLiteralClient(tagSortColumns).withDefault("createdAt"),
	sortOrder: parseAsStringLiteralClient(["asc", "desc"] as const).withDefault(
		"desc",
	),
};
