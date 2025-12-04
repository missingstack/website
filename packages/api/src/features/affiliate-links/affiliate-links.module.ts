import type { Database } from "@missingstack/db";
import { DrizzleAffiliateLinkRepository } from "./affiliate-links.repository";
import { AffiliateLinksService } from "./affiliate-links.service";
import type { AffiliateLinksServiceInterface } from "./affiliate-links.types";

export function createAffiliateLinkService(
	database: Database,
): AffiliateLinksServiceInterface {
	const repository = new DrizzleAffiliateLinkRepository(database);
	return new AffiliateLinksService(repository);
}
