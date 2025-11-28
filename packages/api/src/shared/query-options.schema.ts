import { z } from "zod";

/**
 * Base query options schema for pagination and sorting
 * Can be extended by feature-specific schemas
 */
export const baseQueryOptionsSchema = z.object({
	limit: z.number().int().min(1).max(50).optional(),
	cursor: z.string().nullish(),
	sortBy: z.enum(["name", "newest", "popular", "relevance"]).optional(),
	sortOrder: z.enum(["asc", "desc"]).optional(),
	includeRelations: z.boolean().default(true).optional(),
});

export type BaseQueryOptions = z.infer<typeof baseQueryOptionsSchema>;
