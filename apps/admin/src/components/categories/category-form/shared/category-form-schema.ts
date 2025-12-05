import { z } from "zod";

export const categoryFormSchema = z.object({
	slug: z
		.string()
		.min(1, "Slug is required")
		.max(120, "Slug must be 120 characters or less"),
	name: z
		.string()
		.min(1, "Name is required")
		.max(160, "Name must be 160 characters or less"),
	description: z.string().optional(),
	icon: z
		.string()
		.min(1, "Icon is required")
		.max(100, "Icon must be 100 characters or less"),
	parentId: z.string().uuid().optional().or(z.literal("")),
	weight: z.number().int().optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const defaultCategoryFormValues: CategoryFormValues = {
	slug: "",
	name: "",
	description: "",
	icon: "",
	parentId: "",
	weight: 0,
};
