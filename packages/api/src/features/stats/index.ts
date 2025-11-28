import { publicProcedure, router } from "@missingstack/api/index";
import { statsSchema } from "./stats.schema";

export const statsRouter = router({
	getStats: publicProcedure.output(statsSchema).query(async ({ ctx }) => {
		return ctx.dependencies.statsService.getStats();
	}),
});
