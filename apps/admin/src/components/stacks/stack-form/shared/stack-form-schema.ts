import { z } from "zod";

export const stackFormSchema = z.object({
	slug: z
		.string()
		.min(1, "Slug is required")
		.max(120, "Slug must be 120 characters or less"),
	name: z
		.string()
		.min(1, "Name is required")
		.max(160, "Name must be 160 characters or less"),
	description: z.string().optional(),
	icon: z.string().max(100, "Icon must be 100 characters or less").optional(),
	parentId: z.string().uuid().optional().or(z.literal("")),
	weight: z.number().int().optional(),
});

export type StackFormValues = z.infer<typeof stackFormSchema>;

export const defaultStackFormValues: StackFormValues = {
	slug: "",
	name: "",
	description: "",
	icon: "",
	parentId: "",
	weight: 0,
};
