import type { ToolAffiliateLink } from "@missingstack/db/schema/tool-affiliate-links";
import type {
	AffiliateLinkCollection,
	AffiliateLinkQueryOptions,
	CreateAffiliateLinkInput,
	UpdateAffiliateLinkInput,
} from "./affiliate-links.schema";
import type {
	AffiliateLinkRepositoryInterface,
	AffiliateLinksServiceInterface,
} from "./affiliate-links.types";

export class AffiliateLinksService implements AffiliateLinksServiceInterface {
	constructor(private readonly repository: AffiliateLinkRepositoryInterface) {}

	async getAll(
		options?: AffiliateLinkQueryOptions,
	): Promise<AffiliateLinkCollection> {
		// Sanitize and validate options
		const sanitizedOptions: AffiliateLinkQueryOptions = {
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

	async getById(id: string): Promise<ToolAffiliateLink | null> {
		return this.repository.getById(id);
	}

	async create(input: CreateAffiliateLinkInput): Promise<ToolAffiliateLink> {
		return this.repository.create(input);
	}

	async update(
		id: string,
		input: UpdateAffiliateLinkInput,
	): Promise<ToolAffiliateLink> {
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
