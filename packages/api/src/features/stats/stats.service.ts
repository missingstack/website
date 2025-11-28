import type {
	Stats,
	StatsRepositoryInterface,
	StatsServiceInterface,
} from "./stats.types";

export class StatsService implements StatsServiceInterface {
	constructor(private readonly repository: StatsRepositoryInterface) {}

	async getStats(): Promise<Stats> {
		return this.repository.getStats();
	}
}
