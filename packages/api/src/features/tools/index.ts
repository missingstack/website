import { publicProcedure, router } from "@missingstack/api/index";
import { z } from "zod";
import {
	getByCategorySchema,
	getByTagSchema,
	getPresetSchema,
	searchSchema,
	toolCollectionSchema,
	toolDataSchema,
	toolQueryOptionsSchema,
	toolSchema,
} from "./tools.schema";

export const toolsRouter = router({
	// List queries
	getAll: publicProcedure
		.input(toolQueryOptionsSchema.optional())
		.output(toolCollectionSchema)
		.query(async ({ ctx, input }) => {
			return ctx.dependencies.toolsService.getAll(input ?? {});
		}),

	getByCategory: publicProcedure
		.input(getByCategorySchema)
		.output(toolCollectionSchema)
		.query(async ({ ctx, input }) => {
			return ctx.dependencies.toolsService.getByCategory(
				input.categoryId,
				input.options,
			);
		}),

	getByTag: publicProcedure
		.input(getByTagSchema)
		.output(toolCollectionSchema)
		.query(async ({ ctx, input }) => {
			return ctx.dependencies.toolsService.getByTag(input.tagId, input.options);
		}),

	search: publicProcedure
		.input(searchSchema)
		.output(toolCollectionSchema)
		.query(async ({ ctx, input }) => {
			return ctx.dependencies.toolsService.search(input.query, input.options);
		}),

	// Single item queries
	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.output(toolDataSchema.nullable())
		.query(async ({ ctx, input }) => {
			return ctx.dependencies.toolsService.getById(input.id);
		}),

	getBySlug: publicProcedure
		.input(z.object({ slug: z.string() }))
		.output(toolDataSchema.nullable())
		.query(async ({ ctx, input }) => {
			return ctx.dependencies.toolsService.getBySlug(input.slug);
		}),

	// Preset queries
	getFeatured: publicProcedure
		.input(getPresetSchema.optional())
		.output(z.array(toolSchema))
		.query(async ({ ctx, input }) => {
			return ctx.dependencies.toolsService.getFeatured(input?.limit);
		}),

	getRecent: publicProcedure
		.input(getPresetSchema.optional())
		.output(z.array(toolSchema))
		.query(async ({ ctx, input }) => {
			return ctx.dependencies.toolsService.getRecent(input?.limit);
		}),

	getPopular: publicProcedure
		.input(getPresetSchema.optional())
		.output(z.array(toolSchema))
		.query(async ({ ctx, input }) => {
			return ctx.dependencies.toolsService.getPopular(input?.limit);
		}),
});
