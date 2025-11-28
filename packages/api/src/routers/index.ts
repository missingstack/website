import { toolsRouter } from "@missingstack/api/features/tools";
import { publicProcedure, router } from "@missingstack/api/index";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => "OK"),
	tools: toolsRouter,
});

export type AppRouter = typeof appRouter;
