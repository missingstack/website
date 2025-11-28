import { platformEnum, pricingEnum } from "@missingstack/db/schema/enums";
import { z } from "zod";

const pricingEnumValues = pricingEnum.enumValues;
const platformEnumValues = platformEnum.enumValues;

export const toolSchema = z.object({
	id: z.string(),
	slug: z.string(),
	name: z.string(),
	tagline: z.string(),
	description: z.string(),
	logo: z.string(),
	website: z.string().nullable(),
	pricing: z.enum(pricingEnumValues),
	featured: z.boolean().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const toolCollectionSchema = z.object({
	items: z.array(toolSchema),
	nextCursor: z.string().nullable(),
	hasMore: z.boolean(),
});

// Base query options schema
const queryOptionsSchema = z.object({
	limit: z.number().int().min(1).max(50).optional(),
	cursor: z.string().nullish(),
	sortBy: z.enum(["name", "newest", "popular", "relevance"]).optional(),
	sortOrder: z.enum(["asc", "desc"]).optional(),
	includeRelations: z.boolean().default(true).optional(),
});

// Extended tool query options schema
export const toolQueryOptionsSchema = queryOptionsSchema
	.extend({
		categoryIds: z.array(z.string()).optional(),
		tagIds: z.array(z.string()).optional(),
		platforms: z.array(z.enum(platformEnumValues)).optional(),
		pricing: z.array(z.enum(pricingEnumValues)).optional(),
		featured: z.boolean().optional(),
		search: z.string().optional(),
	})
	.strict();

export type ToolCollection = z.infer<typeof toolCollectionSchema>;
export type ToolQueryOptions = z.infer<typeof toolQueryOptionsSchema>;
export type QueryOptions = z.infer<typeof queryOptionsSchema>;
