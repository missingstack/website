import { baseQueryOptionsSchema } from "@missingstack/api/shared";
import { pricingEnum } from "@missingstack/db/schema/enums";
import type { Tool } from "@missingstack/db/schema/tools";
import { z } from "zod";

const pricingEnumValues = pricingEnum.enumValues;

// Tool with relations
export type ToolData = Tool & {
	categoryIds: string[];
	tagIds: string[];
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
		pricing: z.array(z.enum(pricingEnumValues)).optional(),
		featured: z.boolean().optional(),
		search: z.string().optional(),
	})
	.strict();

export type ToolQueryOptions = z.infer<typeof toolQueryOptionsSchema>;
