import type { Database } from "@missingstack/db";
import { DrizzleStatsRepository } from "./stats.repository";
import { StatsService } from "./stats.service";
import type { StatsServiceInterface } from "./stats.types";

export function createStatsService(database: Database): StatsServiceInterface {
	const repository = new DrizzleStatsRepository(database);
	return new StatsService(repository);
}
