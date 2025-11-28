import type { Database } from "@missingstack/db";
import { DrizzleStatsRepository } from "./stats.repository";
import { StatsService } from "./stats.service";
import type { StatsServiceInterface } from "./stats.types";

export type StatsModule = {
	statsService: StatsServiceInterface;
};

export function createStatsModule(database: Database): StatsModule {
	const repository = new DrizzleStatsRepository(database);
	const statsService = new StatsService(repository);

	return {
		statsService,
	};
}
