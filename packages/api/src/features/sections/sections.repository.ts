import { type Section, getEnabledSections, sections } from "./sections.config";
import type { SectionRepositoryInterface } from "./sections.types";

export class StaticSectionRepository implements SectionRepositoryInterface {
	async getAll(): Promise<Section[]> {
		return sections;
	}

	async getById(id: string): Promise<Section | null> {
		return sections.find((s) => s.id === id) ?? null;
	}

	async getEnabled(): Promise<Section[]> {
		return getEnabledSections();
	}
}
