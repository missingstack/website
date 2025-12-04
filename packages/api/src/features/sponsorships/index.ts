import { services } from "@missingstack/api/context";
import type { Elysia } from "elysia";
import { t } from "elysia";
import {
	type SponsorshipQueryOptions,
	createSponsorshipSchema,
	sponsorshipQueryOptionsSchema,
	updateSponsorshipSchema,
} from "./sponsorships.schema";

export type { ToolSponsorship } from "@missingstack/db/schema/tool-sponsorships";
export type {
	SponsorshipCollection,
	SponsorshipQueryOptions,
} from "./sponsorships.schema";
export type {
	SponsorshipRepositoryInterface,
	SponsorshipWithTool,
	SponsorshipsServiceInterface,
} from "./sponsorships.types";

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
 * Parse and validate query parameters into SponsorshipQueryOptions
 */
function parseQueryOptions(
	params: Record<string, unknown>,
): SponsorshipQueryOptions | undefined {
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
	if (params.tier) options.tier = params.tier;
	if (params.paymentStatus) options.paymentStatus = params.paymentStatus;
	if (params.isActive !== undefined) {
		options.isActive = params.isActive === "true" || params.isActive === true;
	}

	// Validate and parse with schema, return undefined if empty or invalid
	const result = sponsorshipQueryOptionsSchema.safeParse(options);
	if (!result.success) return undefined;
	return result.data;
}

export function createSponsorshipsRouter(app: Elysia) {
	return app.group("/sponsorships", (app) =>
		app
			.post(
				"/",
				async ({ body }) => {
					const result = createSponsorshipSchema.safeParse(body);
					if (!result.success) {
						throw new Error(
							`Invalid sponsorship data: ${result.error.issues.map((e) => e.message).join(", ")}`,
						);
					}
					return services.sponsorshipService.create(result.data);
				},
				{
					body: t.Object({
						toolId: t.String(),
						tier: t.String(),
						startDate: t.String(),
						endDate: t.String(),
						isActive: t.Optional(t.Boolean()),
						priorityWeight: t.Optional(t.Number()),
						paymentStatus: t.Optional(t.String()),
					}),
				},
			)
			.get("/", async ({ request }) => {
				const rawQueryOptions = parseRawQuery(request.url);
				const options = parseQueryOptions(rawQueryOptions);
				return services.sponsorshipService.getAll(options);
			})
			.get(
				"/:id",
				async ({ params: { id } }) => {
					return services.sponsorshipService.getById(id);
				},
				{
					params: t.Object({ id: t.String() }),
				},
			)
			.put(
				"/:id",
				async ({ params: { id }, body }) => {
					const result = updateSponsorshipSchema.safeParse(body);
					if (!result.success) {
						throw new Error(
							`Invalid sponsorship data: ${result.error.issues.map((e) => e.message).join(", ")}`,
						);
					}
					return services.sponsorshipService.update(id, result.data);
				},
				{
					params: t.Object({ id: t.String() }),
					body: t.Object({
						toolId: t.Optional(t.String()),
						tier: t.Optional(t.String()),
						startDate: t.Optional(t.String()),
						endDate: t.Optional(t.String()),
						isActive: t.Optional(t.Boolean()),
						priorityWeight: t.Optional(t.Number()),
						paymentStatus: t.Optional(t.String()),
					}),
				},
			)
			.delete(
				"/:id",
				async ({ params: { id } }) => {
					await services.sponsorshipService.delete(id);
					return { success: true };
				},
				{
					params: t.Object({ id: t.String() }),
				},
			),
	);
}
