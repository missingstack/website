import { categoriesRouter } from "@missingstack/api/features/categories";
import { sectionsRouter } from "@missingstack/api/features/sections";
import { statsRouter } from "@missingstack/api/features/stats";
import { tagsRouter } from "@missingstack/api/features/tags";
import { toolsRouter } from "@missingstack/api/features/tools";
import { publicProcedure, router } from "@missingstack/api/index";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => "OK"),
	tools: toolsRouter,
	categories: categoriesRouter,
	tags: tagsRouter,
	sections: sectionsRouter,
	stats: statsRouter,
});

export type AppRouter = typeof appRouter;
