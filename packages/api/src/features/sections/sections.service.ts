import type {
	SectionData,
	SectionRepositoryInterface,
	SectionsServiceInterface,
} from "./sections.types";

export class SectionsService implements SectionsServiceInterface {
	constructor(private readonly repository: SectionRepositoryInterface) {}

	async getAll(): Promise<SectionData[]> {
		return this.repository.getAll();
	}

	async getById(id: string): Promise<SectionData | null> {
		return this.repository.getById(id);
	}

	async getEnabled(): Promise<SectionData[]> {
		return this.repository.getEnabled();
	}
}
