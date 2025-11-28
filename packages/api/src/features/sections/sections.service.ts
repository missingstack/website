import type {
	Section,
	SectionRepositoryInterface,
	SectionsServiceInterface,
} from "./sections.types";

export class SectionsService implements SectionsServiceInterface {
	constructor(private readonly repository: SectionRepositoryInterface) {}

	async getAll(): Promise<Section[]> {
		return this.repository.getAll();
	}

	async getById(id: string): Promise<Section | null> {
		return this.repository.getById(id);
	}

	async getEnabled(): Promise<Section[]> {
		return this.repository.getEnabled();
	}
}
