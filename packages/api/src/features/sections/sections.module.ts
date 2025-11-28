import { StaticSectionRepository } from "./sections.repository";
import { SectionsService } from "./sections.service";
import type { SectionsServiceInterface } from "./sections.types";

export function createSectionService(): SectionsServiceInterface {
	const repository = new StaticSectionRepository();
	return new SectionsService(repository);
}
