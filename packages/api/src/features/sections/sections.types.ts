import type { Section } from "./sections.config";

export type { Section };

export interface SectionRepositoryInterface {
	getAll(): Promise<Section[]>;
	getById(id: string): Promise<Section | null>;
	getEnabled(): Promise<Section[]>;
}

export interface SectionsServiceInterface {
	getAll(): Promise<Section[]>;
	getById(id: string): Promise<Section | null>;
	getEnabled(): Promise<Section[]>;
}
