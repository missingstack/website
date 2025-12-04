import type { EntityWith } from "@missingstack/api/shared";
import type { ToolAffiliateLink } from "@missingstack/db/schema/tool-affiliate-links";
import type {
	AffiliateLinkCollection,
	AffiliateLinkQueryOptions,
	CreateAffiliateLinkInput,
	UpdateAffiliateLinkInput,
} from "./affiliate-links.schema";

export type ToolAffiliateLinkWith<P = Record<string, unknown>> = EntityWith<
	ToolAffiliateLink,
	P
>;
export type AffiliateLinkWithTool = ToolAffiliateLinkWith<{
	tool?: {
		id: string;
		name: string;
		slug: string;
	};
}>;

export interface AffiliateLinkRepositoryInterface {
	getAll(options?: AffiliateLinkQueryOptions): Promise<AffiliateLinkCollection>;
	getById(id: string): Promise<ToolAffiliateLink | null>;
	create(input: CreateAffiliateLinkInput): Promise<ToolAffiliateLink>;
	update(
		id: string,
		input: UpdateAffiliateLinkInput,
	): Promise<ToolAffiliateLink>;
	delete(id: string): Promise<void>;
}

export interface AffiliateLinksServiceInterface {
	getAll(options?: AffiliateLinkQueryOptions): Promise<AffiliateLinkCollection>;
	getById(id: string): Promise<ToolAffiliateLink | null>;
	create(input: CreateAffiliateLinkInput): Promise<ToolAffiliateLink>;
	update(
		id: string,
		input: UpdateAffiliateLinkInput,
	): Promise<ToolAffiliateLink>;
	delete(id: string): Promise<void>;
}
