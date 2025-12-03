import { services } from "@missingstack/api/context";
import type { Elysia } from "elysia";
import { t } from "elysia";

export type { Tool } from "@missingstack/db/schema/tools";

import {
	type ToolQueryOptions,
	createToolSchema,
	toolQueryOptionsSchema,
} from "./tools.schema";

export type {
	ToolCollection,
	ToolData,
	ToolQueryOptions,
	ToolWithAlternativeCount,
	ToolWithAlternativeCountCollection,
} from "./tools.schema";

export type {
	ToolRepositoryInterface,
	ToolsServiceInterface,
} from "./tools.types";

/**
 * Parse raw query string from URL to preserve array parameters
 * Handles cases like pricing=Free&pricing=Freemium
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
 * Parse and validate query parameters into ToolQueryOptions
 * Uses toolQueryOptionsSchema (which extends baseQueryOptionsSchema)
 */
function parseQueryOptions(
	params: Record<string, unknown>,
): ToolQueryOptions | undefined {
	const options: Record<string, unknown> = {};
	if (params.limit) options.limit = params.limit;
	if (params.cursor) options.cursor = params.cursor;
	if (params.sortBy) options.sortBy = params.sortBy;
	if (params.sortOrder) options.sortOrder = params.sortOrder;

	// Relations
	if (params.includeRelations)
		options.includeRelations = params.includeRelations;

	// Tool-specific filters - support both frontend and backend formats
	if (params.categoryIds) {
		options.categoryIds = Array.isArray(params.categoryIds)
			? params.categoryIds
			: [params.categoryIds];
	}
	if (params.tagIds) {
		options.tagIds = Array.isArray(params.tagIds)
			? params.tagIds
			: [params.tagIds];
	}
	if (params.pricing) {
		options.pricing = Array.isArray(params.pricing)
			? params.pricing
			: [params.pricing];
	}
	if (params.featured) options.featured = params.featured;
	if (params.search) options.search = params.search;

	// Validate and parse with schema, return undefined if empty or invalid
	const result = toolQueryOptionsSchema.safeParse(options);
	if (!result.success) return undefined;
	return result.data;
}

export function createToolsRouter(app: Elysia) {
	return app.group("/tools", (app) =>
		app
			.post(
				"/",
				async ({ body }) => {
					const result = createToolSchema.safeParse(body);
					if (!result.success) {
						throw new Error(
							`Invalid tool data: ${result.error.issues.map((e) => e.message).join(", ")}`,
						);
					}
					return services.toolService.create(result.data);
				},
				{
					body: t.Object({
						slug: t.String(),
						name: t.String(),
						tagline: t.Optional(t.String()),
						description: t.String(),
						logo: t.String(),
						website: t.Optional(t.String()),
						pricing: t.String(),
						license: t.Optional(t.String()),
						featured: t.Optional(t.Boolean()),
						affiliateUrl: t.Optional(t.String()),
						sponsorshipPriority: t.Optional(t.Number()),
						isSponsored: t.Optional(t.Boolean()),
						monetizationEnabled: t.Optional(t.Boolean()),
						categoryIds: t.Optional(t.Array(t.String())),
						stackIds: t.Optional(t.Array(t.String())),
						tagIds: t.Optional(t.Array(t.String())),
						alternativeIds: t.Optional(t.Array(t.String())),
					}),
				},
			)
			.get("/", async ({ request }) => {
				const rawQueryOptions = parseRawQuery(request.url);
				const options = parseQueryOptions(rawQueryOptions);
				return services.toolService.getAll(options);
			})
			.get(
				"/category/:categoryId",
				async ({ params: { categoryId }, request }) => {
					const rawQueryOptions = parseRawQuery(request.url);
					const options = parseQueryOptions(rawQueryOptions);
					return services.toolService.getByCategory(categoryId, options);
				},
				{
					params: t.Object({ categoryId: t.String() }),
				},
			)
			.get(
				"/tag/:tagId",
				async ({ params: { tagId }, request }) => {
					const rawQueryOptions = parseRawQuery(request.url);
					const options = parseQueryOptions(rawQueryOptions);
					return services.toolService.getByTag(tagId, options);
				},
				{
					params: t.Object({ tagId: t.String() }),
				},
			)
			.get(
				"/search",
				async ({ query, request }) => {
					const rawQueryOptions = parseRawQuery(request.url);
					const options = parseQueryOptions(rawQueryOptions);
					return services.toolService.search(query.search, options);
				},
				{
					query: t.Object({ search: t.String() }),
				},
			)
			.get("/with-alternative-counts", async ({ request }) => {
				const rawQueryOptions = parseRawQuery(request.url);
				const options = parseQueryOptions(rawQueryOptions);
				return services.toolService.getAllWithAlternativeCounts(options);
			})
			.get(
				"/:id",
				async ({ params: { id } }) => {
					return services.toolService.getById(id);
				},
				{
					params: t.Object({ id: t.String() }),
				},
			)
			.get(
				"/slug/:slug",
				async ({ params: { slug } }) => {
					return services.toolService.getBySlug(slug);
				},
				{
					params: t.Object({ slug: t.String() }),
				},
			)
			.get(
				"/featured",
				async ({ query }) => {
					const limit = query?.limit
						? Number.parseInt(query.limit, 10)
						: undefined;
					return services.toolService.getFeatured(limit);
				},
				{
					query: t.Optional(t.Object({ limit: t.Optional(t.String()) })),
				},
			)
			.get(
				"/recent",
				async ({ query }) => {
					const limit = query?.limit
						? Number.parseInt(query.limit, 10)
						: undefined;
					return services.toolService.getRecent(limit);
				},
				{
					query: t.Optional(t.Object({ limit: t.Optional(t.String()) })),
				},
			)
			.get(
				"/popular",
				async ({ query }) => {
					const limit = query?.limit
						? Number.parseInt(query.limit, 10)
						: undefined;
					return services.toolService.getPopular(limit);
				},
				{
					query: t.Optional(t.Object({ limit: t.Optional(t.String()) })),
				},
			),
	);
}
