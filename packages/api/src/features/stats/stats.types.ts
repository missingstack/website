import type { Stats } from "./stats.schema";
export type { Stats };

export interface StatsRepositoryInterface {
	getStats(): Promise<Stats>;
}

export interface StatsServiceInterface {
	getStats(): Promise<Stats>;
}
