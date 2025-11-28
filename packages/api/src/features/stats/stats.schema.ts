import { z } from "zod";

export const statsSchema = z.object({
	totalTools: z.number().int().min(0),
	totalCategories: z.number().int().min(0),
	totalTags: z.number().int().min(0),
	featuredTools: z.number().int().min(0),
});

export type Stats = z.infer<typeof statsSchema>;
