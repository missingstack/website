import { publicProcedure, router } from "@missingstack/api/index";
import { z } from "zod";
import {
	categoriesListSchema,
	categoriesWithCountsListSchema,
	categorySchema,
	getTopCategoriesSchema,
} from "./categories.schema";

export const categoriesRouter = router({
	getAll: publicProcedure
		.output(categoriesListSchema)
		.query(async ({ ctx }) => {
			return ctx.dependencies.categoriesService.getAll();
		}),

	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.output(categorySchema.nullable())
		.query(async ({ ctx, input }) => {
			return ctx.dependencies.categoriesService.getById(input.id);
		}),

	getBySlug: publicProcedure
		.input(z.object({ slug: z.string() }))
		.output(categorySchema.nullable())
		.query(async ({ ctx, input }) => {
			return ctx.dependencies.categoriesService.getBySlug(input.slug);
		}),

	getAllWithCounts: publicProcedure
		.output(categoriesWithCountsListSchema)
		.query(async ({ ctx }) => {
			return ctx.dependencies.categoriesService.getAllWithCounts();
		}),

	getTopCategories: publicProcedure
		.input(getTopCategoriesSchema.optional())
		.output(categoriesWithCountsListSchema)
		.query(async ({ ctx, input }) => {
			return ctx.dependencies.categoriesService.getTopCategories(input?.limit);
		}),
});
