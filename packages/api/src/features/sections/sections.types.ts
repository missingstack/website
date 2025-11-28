import type {
	IconColor,
	SectionFilter,
	SectionLayout,
	SectionType,
} from "@missingstack/db/schema/enums";

export interface SectionData {
	id: string;
	type: SectionType;
	filter: SectionFilter | null;
	categoryId: string | null;
	title: string;
	description: string | null;
	icon: string;
	iconColor: IconColor | null;
	limit: number | null;
	layout: SectionLayout | null;
	enabled: boolean | null;
	weight: number | null;
}

export interface SectionRepositoryInterface {
	getAll(): Promise<SectionData[]>;
	getById(id: string): Promise<SectionData | null>;
	getEnabled(): Promise<SectionData[]>;
}

export interface SectionsServiceInterface {
	getAll(): Promise<SectionData[]>;
	getById(id: string): Promise<SectionData | null>;
	getEnabled(): Promise<SectionData[]>;
}
