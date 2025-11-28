import { publicProcedure, router } from "@missingstack/api/index";
import { toolCollectionSchema, toolQueryOptionsSchema } from "./tools.schema";

export const toolsRouter = router({
	getAllTools: publicProcedure
		.input(toolQueryOptionsSchema.optional())
		.output(toolCollectionSchema)
		.query(async ({ ctx, input }) => {
			return ctx.dependencies.toolsService.getAllTools(input ?? {});
		}),
});
