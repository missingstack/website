import { services } from "@missingstack/api/context";
import type { Elysia } from "elysia";
import { t } from "elysia";
import {
	type CategoryQueryOptions,
	categoryQueryOptionsSchema,
} from "./categories.schema";

export type { Category } from "@missingstack/db/schema/categories";
export type {
	CategoryCollection,
	CategoryQueryOptions,
} from "./categories.schema";
export type {
	CategoriesServiceInterface,
	CategoryRepositoryInterface,
	CategoryWithCount,
} from "./categories.types";

/**
 * Parse raw query string from URL to preserve array parameters
 */
function parseRawQuery(url: string | URL): Record<string, string | string[]> {
	const parsedUrl = typeof url === "string" ? new URL(url) : url;
	const params: Record<string, string | string[]> = {};

	parsedUrl.searchParams.forEach((value, key) => {
		const existing = params[key];
		if (existing === undefined) {
			params[key] = value;
		} else if (Array.isArray(existing)) {
			existing.push(value);
		} else {
			params[key] = [existing, value];
		}
	});

	return params;
}

/**
 * Parse and validate query parameters into CategoryQueryOptions
 */
function parseQueryOptions(
	params: Record<string, unknown>,
): CategoryQueryOptions | undefined {
	const options: Record<string, unknown> = {};
	if (params.limit) {
		const limit = Number.parseInt(String(params.limit), 10);
		if (!Number.isNaN(limit)) options.limit = limit;
	}
	if (params.cursor) options.cursor = params.cursor;
	if (params.sortBy) options.sortBy = params.sortBy;
	if (params.sortOrder) options.sortOrder = params.sortOrder;
	if (params.search) options.search = params.search;

	// Validate and parse with schema, return undefined if empty or invalid
	const result = categoryQueryOptionsSchema.safeParse(options);
	if (!result.success) return undefined;
	return result.data;
}

export function createCategoriesRouter(app: Elysia) {
	return app.group("/categories", (app) =>
		app
			.get("/", async ({ request }) => {
				const rawQueryOptions = parseRawQuery(request.url);
				const options = parseQueryOptions(rawQueryOptions);
				return services.categoryService.getAll(options);
			})
			.get(
				"/:id",
				async ({ params: { id } }) => {
					return services.categoryService.getById(id);
				},
				{
					params: t.Object({ id: t.String() }),
				},
			)
			.get(
				"/slug/:slug",
				async ({ params: { slug } }) => {
					return services.categoryService.getBySlug(slug);
				},
				{
					params: t.Object({ slug: t.String() }),
				},
			)
			.get("/with-counts", async () => {
				return services.categoryService.getAllWithCounts();
			})
			.get(
				"/top",
				async ({ query }) => {
					const limit = query?.limit
						? Number.parseInt(query.limit, 10)
						: undefined;
					return services.categoryService.getTopCategories(limit);
				},
				{
					query: t.Optional(t.Object({ limit: t.Optional(t.String()) })),
				},
			),
	);
}
