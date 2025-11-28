import { z } from "zod";

export const categorySchema = z.object({
	id: z.string(),
	slug: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	icon: z.string(),
	parentId: z.string().nullable(),
	weight: z.number().int().nullable(),
});

export const categoryWithCountSchema = categorySchema.extend({
	toolCount: z.number().int().min(0),
});

export const categoriesListSchema = z.array(categorySchema);
export const categoriesWithCountsListSchema = z.array(categoryWithCountSchema);

export const getTopCategoriesSchema = z.object({
	limit: z.number().int().min(1).max(100).optional(),
});

export type Category = z.infer<typeof categorySchema>;
export type CategoryWithCount = z.infer<typeof categoryWithCountSchema>;
