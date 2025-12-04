import type { ToolSponsorship } from "@missingstack/db/schema/tool-sponsorships";
import type {
	CreateSponsorshipInput,
	SponsorshipCollection,
	SponsorshipQueryOptions,
	UpdateSponsorshipInput,
} from "./sponsorships.schema";
import type {
	SponsorshipRepositoryInterface,
	SponsorshipsServiceInterface,
} from "./sponsorships.types";

export class SponsorshipsService implements SponsorshipsServiceInterface {
	constructor(private readonly repository: SponsorshipRepositoryInterface) {}

	async getAll(
		options?: SponsorshipQueryOptions,
	): Promise<SponsorshipCollection> {
		// Sanitize and validate options
		const sanitizedOptions: SponsorshipQueryOptions = {
			...options,
			cursor: options?.cursor ?? null,
			limit: clampLimit(options?.limit),
			sortBy: options?.sortBy ?? "createdAt",
			sortOrder: options?.sortOrder ?? "desc",
			includeRelations: options?.includeRelations ?? true,
			// Trim search term
			search: options?.search?.trim() || undefined,
		};

		return this.repository.getAll(sanitizedOptions);
	}

	async getById(id: string): Promise<ToolSponsorship | null> {
		return this.repository.getById(id);
	}

	async create(input: CreateSponsorshipInput): Promise<ToolSponsorship> {
		return this.repository.create(input);
	}

	async update(
		id: string,
		input: UpdateSponsorshipInput,
	): Promise<ToolSponsorship> {
		return this.repository.update(id, input);
	}

	async delete(id: string): Promise<void> {
		return this.repository.delete(id);
	}
}

function clampLimit(limit?: number): number {
	const DEFAULT_LIMIT = 20;
	const MAX_LIMIT = 50;
	if (!limit) return DEFAULT_LIMIT;
	return Math.min(Math.max(limit, 1), MAX_LIMIT);
}
