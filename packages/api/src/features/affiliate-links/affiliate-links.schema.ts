import { baseQueryOptionsSchema } from "@missingstack/api/shared";
import type { ToolAffiliateLink } from "@missingstack/db/schema/tool-affiliate-links";
import { z } from "zod";

// Affiliate link collection response
export type AffiliateLinkCollection = {
	items: ToolAffiliateLink[];
	nextCursor: string | null;
	hasMore: boolean;
};

// Affiliate link query options schema
export const affiliateLinkQueryOptionsSchema = baseQueryOptionsSchema
	.extend({
		search: z.string().optional(),
		sortBy: z
			.enum(["createdAt", "clickCount", "revenueTracked", "commissionRate"])
			.optional(),
		toolId: z.string().uuid().optional(),
		isPrimary: z.boolean().optional(),
	})
	.strict();

export type AffiliateLinkQueryOptions = z.infer<
	typeof affiliateLinkQueryOptionsSchema
>;

// Create affiliate link request schema
export const createAffiliateLinkSchema = z
	.object({
		toolId: z.string().uuid(),
		affiliateUrl: z.string().url().max(512),
		commissionRate: z.number().min(0).max(1).default(0),
		trackingCode: z.string().max(100).optional(),
		isPrimary: z.boolean().default(false),
	})
	.strict();

export type CreateAffiliateLinkInput = z.infer<
	typeof createAffiliateLinkSchema
>;

// Update affiliate link request schema (all fields optional)
export const updateAffiliateLinkSchema = createAffiliateLinkSchema
	.partial()
	.extend({
		affiliateUrl: z.string().url().max(512).optional(),
		commissionRate: z.number().min(0).max(1).optional(),
		trackingCode: z.string().max(100).optional(),
	})
	.strict();

export type UpdateAffiliateLinkInput = z.infer<
	typeof updateAffiliateLinkSchema
>;
