import { baseQueryOptionsSchema } from "@missingstack/api/shared";
import type { ToolSponsorship } from "@missingstack/db/schema/tool-sponsorships";
import { z } from "zod";

// Sponsorship collection response
export type SponsorshipCollection = {
	items: ToolSponsorship[];
	nextCursor: string | null;
	hasMore: boolean;
};

// Sponsorship query options schema
export const sponsorshipQueryOptionsSchema = baseQueryOptionsSchema
	.extend({
		search: z.string().optional(),
		sortBy: z
			.enum(["startDate", "endDate", "priorityWeight", "createdAt"])
			.optional(),
		toolId: z.string().uuid().optional(),
		tier: z.enum(["basic", "premium", "enterprise"]).optional(),
		paymentStatus: z
			.enum(["pending", "completed", "failed", "refunded"])
			.optional(),
		isActive: z.boolean().optional(),
	})
	.strict();

export type SponsorshipQueryOptions = z.infer<
	typeof sponsorshipQueryOptionsSchema
>;

// Create sponsorship request schema
export const createSponsorshipSchema = z
	.object({
		toolId: z.string().uuid(),
		tier: z.enum(["basic", "premium", "enterprise"]),
		startDate: z.string().datetime(),
		endDate: z.string().datetime(),
		isActive: z.boolean().default(true),
		priorityWeight: z.number().int().default(0),
		paymentStatus: z
			.enum(["pending", "completed", "failed", "refunded"])
			.default("pending"),
	})
	.refine((data) => new Date(data.endDate) > new Date(data.startDate), {
		message: "End date must be after start date",
		path: ["endDate"],
	})
	.strict();

export type CreateSponsorshipInput = z.infer<typeof createSponsorshipSchema>;

// Update sponsorship request schema (all fields optional)
export const updateSponsorshipSchema = createSponsorshipSchema
	.partial()
	.extend({
		startDate: z.string().datetime().optional(),
		endDate: z.string().datetime().optional(),
	})
	.refine(
		(data) => {
			if (data.startDate && data.endDate) {
				return new Date(data.endDate) > new Date(data.startDate);
			}
			return true;
		},
		{
			message: "End date must be after start date",
			path: ["endDate"],
		},
	)
	.strict();

export type UpdateSponsorshipInput = z.infer<typeof updateSponsorshipSchema>;
