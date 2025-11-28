import { StaticSectionRepository } from "./sections.repository";
import { SectionsService } from "./sections.service";
import type { SectionsServiceInterface } from "./sections.types";

export type SectionModule = {
	sectionsService: SectionsServiceInterface;
};

export function createSectionModule(): SectionModule {
	const repository = new StaticSectionRepository();
	const sectionsService = new SectionsService(repository);

	return {
		sectionsService,
	};
}
