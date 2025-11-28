export interface Stats {
	totalTools: number;
	totalCategories: number;
	totalTags: number;
	featuredTools: number;
}

export interface StatsRepositoryInterface {
	getStats(): Promise<Stats>;
}

export interface StatsServiceInterface {
	getStats(): Promise<Stats>;
}
