import { getEnabledSections, sections } from "./sections.config";
import type { SectionData, SectionRepositoryInterface } from "./sections.types";

export class StaticSectionRepository implements SectionRepositoryInterface {
	async getAll(): Promise<SectionData[]> {
		return sections;
	}

	async getById(id: string): Promise<SectionData | null> {
		return sections.find((s) => s.id === id) ?? null;
	}

	async getEnabled(): Promise<SectionData[]> {
		return getEnabledSections();
	}
}
