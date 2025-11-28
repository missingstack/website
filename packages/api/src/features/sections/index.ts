import { publicProcedure, router } from "@missingstack/api/index";
import { z } from "zod";
import { sectionSchema, sectionsListSchema } from "./sections.schema";

export const sectionsRouter = router({
	getAll: publicProcedure.output(sectionsListSchema).query(async ({ ctx }) => {
		return ctx.dependencies.sectionsService.getAll();
	}),

	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.output(sectionSchema.nullable())
		.query(async ({ ctx, input }) => {
			return ctx.dependencies.sectionsService.getById(input.id);
		}),

	getEnabled: publicProcedure
		.output(sectionsListSchema)
		.query(async ({ ctx }) => {
			return ctx.dependencies.sectionsService.getEnabled();
		}),
});
