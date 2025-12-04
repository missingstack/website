import type { ToolSponsorship } from "@missingstack/db/schema/tool-sponsorships";
import type {
	CreateSponsorshipInput,
	SponsorshipCollection,
	SponsorshipQueryOptions,
	UpdateSponsorshipInput,
} from "./sponsorships.schema";

// Sponsorship with tool information
export type SponsorshipWithTool = ToolSponsorship & {
	tool?: {
		id: string;
		name: string;
		slug: string;
	};
};

export interface SponsorshipRepositoryInterface {
	getAll(options?: SponsorshipQueryOptions): Promise<SponsorshipCollection>;
	getById(id: string): Promise<ToolSponsorship | null>;
	create(input: CreateSponsorshipInput): Promise<ToolSponsorship>;
	update(id: string, input: UpdateSponsorshipInput): Promise<ToolSponsorship>;
	delete(id: string): Promise<void>;
}

export interface SponsorshipsServiceInterface {
	getAll(options?: SponsorshipQueryOptions): Promise<SponsorshipCollection>;
	getById(id: string): Promise<ToolSponsorship | null>;
	create(input: CreateSponsorshipInput): Promise<ToolSponsorship>;
	update(id: string, input: UpdateSponsorshipInput): Promise<ToolSponsorship>;
	delete(id: string): Promise<void>;
}
