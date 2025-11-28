import { services } from "@missingstack/api/context";
import type { Elysia } from "elysia";

export type { Stats } from "./stats.schema";
export type {
	StatsRepositoryInterface,
	StatsServiceInterface,
} from "./stats.types";

export function createStatsRouter(app: Elysia) {
	return app.group("/stats", (app) =>
		app.get("/", async () => {
			return services.statsService.getStats();
		}),
	);
}
