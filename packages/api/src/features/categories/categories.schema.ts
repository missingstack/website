import { baseQueryOptionsSchema } from "@missingstack/api/shared";
import type { Category } from "@missingstack/db/schema/categories";
import { z } from "zod";

// Category collection response
export type CategoryCollection = {
	items: Category[];
	nextCursor: string | null;
	hasMore: boolean;
};

// Category query options schema
export const categoryQueryOptionsSchema = baseQueryOptionsSchema
	.extend({
		search: z.string().optional(),
		sortBy: z.enum(["name", "slug", "weight", "createdAt"]).optional(),
	})
	.strict();

export type CategoryQueryOptions = z.infer<typeof categoryQueryOptionsSchema>;

// Create category request schema
export const createCategorySchema = z
	.object({
		slug: z.string().min(1).max(120),
		name: z.string().min(1).max(160),
		description: z.string().optional(),
		icon: z.string().min(1).max(100),
		parentId: z.string().uuid().optional(),
		weight: z.number().int().default(0),
	})
	.strict();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

// Update category request schema (same as create, all fields optional except id)
export const updateCategorySchema = createCategorySchema.partial().extend({
	slug: z.string().min(1).max(120).optional(),
	name: z.string().min(1).max(160).optional(),
	icon: z.string().min(1).max(100).optional(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
