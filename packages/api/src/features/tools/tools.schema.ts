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
