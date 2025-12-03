import { baseQueryOptionsSchema } from "@missingstack/api/shared";
import { licenseEnum, pricingEnum } from "@missingstack/db/schema/enums";
import type { Tool } from "@missingstack/db/schema/tools";
import { z } from "zod";

const pricingEnumValues = pricingEnum.enumValues;
const licenseEnumValues = licenseEnum.enumValues;

// Tool with relations
export type ToolData = Tool & {
	categoryIds: string[];
	tagIds: string[];
	stackIds: string[];
	alternativeIds: string[];
};

export type ToolCollection = {
	items: Tool[];
	nextCursor: string | null;
	hasMore: boolean;
};

// Extended tool query options schema
export const toolQueryOptionsSchema = baseQueryOptionsSchema
	.extend({
		categoryIds: z.array(z.string()).optional(),
		tagIds: z.array(z.string()).optional(),
		stackIds: z.array(z.string()).optional(),
		alternativeIds: z.array(z.string()).optional(),
		pricing: z.array(z.enum(pricingEnumValues)).optional(),
		license: z.array(z.enum(licenseEnumValues)).optional(),
		featured: z.boolean().optional(),
		search: z.string().optional(),
	})
	.strict();

export type ToolQueryOptions = z.infer<typeof toolQueryOptionsSchema>;

// Tool with alternative count for admin
export type ToolWithAlternativeCount = Tool & {
	alternativeCount: number;
};

export type ToolWithAlternativeCountCollection = {
	items: ToolWithAlternativeCount[];
	nextCursor: string | null;
	hasMore: boolean;
};

// Create tool request schema
export const createToolSchema = z
	.object({
		slug: z.string().min(1).max(120),
		name: z.string().min(1).max(160),
		tagline: z.string().max(256).optional(),
		description: z.string().min(1),
		logo: z.string().min(1).max(256),
		website: z.string().url().max(256).optional().or(z.literal("")),
		pricing: z.enum(pricingEnumValues),
		license: z.enum(licenseEnumValues).optional(),
		featured: z.boolean().default(false),
		affiliateUrl: z.string().url().max(512).optional().or(z.literal("")),
		sponsorshipPriority: z.number().int().default(0),
		isSponsored: z.boolean().default(false),
		monetizationEnabled: z.boolean().default(false),
		categoryIds: z.array(z.string().uuid()).default([]),
		stackIds: z.array(z.string().uuid()).default([]),
		tagIds: z.array(z.string().uuid()).default([]),
		alternativeIds: z.array(z.string().uuid()).default([]),
	})
	.strict();

export type CreateToolInput = z.infer<typeof createToolSchema>;

// Update tool request schema (same as create, all fields optional)
export const updateToolSchema = createToolSchema.partial().extend({
	slug: z.string().min(1).max(120).optional(),
	name: z.string().min(1).max(160).optional(),
	description: z.string().min(1).optional(),
	logo: z.string().min(1).max(256).optional(),
	pricing: z.enum(pricingEnumValues).optional(),
});

export type UpdateToolInput = z.infer<typeof updateToolSchema>;
