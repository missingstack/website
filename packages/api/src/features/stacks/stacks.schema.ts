import { z } from "zod";

// Create stack request schema
export const createStackSchema = z
	.object({
		slug: z.string().min(1).max(120),
		name: z.string().min(1).max(160),
		description: z.string().optional(),
		icon: z.string().max(100).optional(),
		parentId: z.string().uuid().optional(),
		weight: z.number().int().default(0),
	})
	.strict();

export type CreateStackInput = z.infer<typeof createStackSchema>;

// Update stack request schema (same as create, all fields optional)
export const updateStackSchema = createStackSchema.partial();

export type UpdateStackInput = z.infer<typeof updateStackSchema>;
