import { baseQueryOptionsSchema } from "@missingstack/api/shared";
import type { Category } from "@missingstack/db/schema/categories";
import { z } from "zod";

export type CategoryCollection = {
	items: Category[];
	nextCursor: string | null;
	hasMore: boolean;
};

// Category query options schema
// Supports sorting by: name, slug, weight, createdAt
export const categoryQueryOptionsSchema = baseQueryOptionsSchema
	.extend({
		search: z.string().optional(),
		sortBy: z.enum(["name", "slug", "weight", "createdAt"]).optional(),
	})
	.strict();

export type CategoryQueryOptions = z.infer<typeof categoryQueryOptionsSchema>;
