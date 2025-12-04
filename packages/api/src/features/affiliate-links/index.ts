import { services } from "@missingstack/api/context";
import type { Elysia } from "elysia";
import { t } from "elysia";
import {
	type AffiliateLinkQueryOptions,
	affiliateLinkQueryOptionsSchema,
	createAffiliateLinkSchema,
	updateAffiliateLinkSchema,
} from "./affiliate-links.schema";

export type { ToolAffiliateLink } from "@missingstack/db/schema/tool-affiliate-links";
export type {
	AffiliateLinkCollection,
	AffiliateLinkQueryOptions,
} from "./affiliate-links.schema";
export type {
	AffiliateLinkRepositoryInterface,
	AffiliateLinkWithTool,
	AffiliateLinksServiceInterface,
} from "./affiliate-links.types";

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
 * Parse and validate query parameters into AffiliateLinkQueryOptions
 */
function parseQueryOptions(
	params: Record<string, unknown>,
): AffiliateLinkQueryOptions | undefined {
	const options: Record<string, unknown> = {};
	if (params.limit) {
		const limit = Number.parseInt(String(params.limit), 10);
		if (!Number.isNaN(limit)) options.limit = limit;
	}
	if (params.cursor) options.cursor = params.cursor;
	if (params.sortBy) options.sortBy = params.sortBy;
	if (params.sortOrder) options.sortOrder = params.sortOrder;
	if (params.search) options.search = params.search;
	if (params.toolId) options.toolId = params.toolId;
	if (params.isPrimary !== undefined) {
		options.isPrimary =
			params.isPrimary === "true" || params.isPrimary === true;
	}

	// Validate and parse with schema, return undefined if empty or invalid
	const result = affiliateLinkQueryOptionsSchema.safeParse(options);
	if (!result.success) return undefined;
	return result.data;
}

export function createAffiliateLinksRouter(app: Elysia) {
	return app.group("/affiliate-links", (app) =>
		app
			.post(
				"/",
				async ({ body }) => {
					const result = createAffiliateLinkSchema.safeParse(body);
					if (!result.success) {
						throw new Error(
							`Invalid affiliate link data: ${result.error.issues.map((e) => e.message).join(", ")}`,
						);
					}
					return services.affiliateLinkService.create(result.data);
				},
				{
					body: t.Object({
						toolId: t.String(),
						affiliateUrl: t.String(),
						commissionRate: t.Optional(t.Number()),
						trackingCode: t.Optional(t.String()),
						isPrimary: t.Optional(t.Boolean()),
					}),
				},
			)
			.get("/", async ({ request }) => {
				const rawQueryOptions = parseRawQuery(request.url);
				const options = parseQueryOptions(rawQueryOptions);
				return services.affiliateLinkService.getAll(options);
			})
			.get(
				"/:id",
				async ({ params: { id } }) => {
					return services.affiliateLinkService.getById(id);
				},
				{
					params: t.Object({ id: t.String() }),
				},
			)
			.put(
				"/:id",
				async ({ params: { id }, body }) => {
					const result = updateAffiliateLinkSchema.safeParse(body);
					if (!result.success) {
						throw new Error(
							`Invalid affiliate link data: ${result.error.issues.map((e) => e.message).join(", ")}`,
						);
					}
					return services.affiliateLinkService.update(id, result.data);
				},
				{
					params: t.Object({ id: t.String() }),
					body: t.Object({
						toolId: t.Optional(t.String()),
						affiliateUrl: t.Optional(t.String()),
						commissionRate: t.Optional(t.Number()),
						trackingCode: t.Optional(t.String()),
						isPrimary: t.Optional(t.Boolean()),
					}),
				},
			)
			.delete(
				"/:id",
				async ({ params: { id } }) => {
					await services.affiliateLinkService.delete(id);
					return { success: true };
				},
				{
					params: t.Object({ id: t.String() }),
				},
			),
	);
}
