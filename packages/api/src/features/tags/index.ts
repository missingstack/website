import { publicProcedure, router } from "@missingstack/api/index";
import { z } from "zod";
import { getTagsByTypeSchema, tagSchema, tagsListSchema } from "./tags.schema";

export const tagsRouter = router({
	getAll: publicProcedure.output(tagsListSchema).query(async ({ ctx }) => {
		return ctx.dependencies.tagsService.getAll();
	}),

	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.output(tagSchema.nullable())
		.query(async ({ ctx, input }) => {
			return ctx.dependencies.tagsService.getById(input.id);
		}),

	getBySlug: publicProcedure
		.input(z.object({ slug: z.string() }))
		.output(tagSchema.nullable())
		.query(async ({ ctx, input }) => {
			return ctx.dependencies.tagsService.getBySlug(input.slug);
		}),

	getByType: publicProcedure
		.input(getTagsByTypeSchema)
		.output(tagsListSchema)
		.query(async ({ ctx, input }) => {
			return ctx.dependencies.tagsService.getByType(input.type);
		}),
});
