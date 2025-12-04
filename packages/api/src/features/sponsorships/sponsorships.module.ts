import type { Database } from "@missingstack/db";
import { DrizzleSponsorshipRepository } from "./sponsorships.repository";
import { SponsorshipsService } from "./sponsorships.service";
import type { SponsorshipsServiceInterface } from "./sponsorships.types";

export function createSponsorshipService(
	database: Database,
): SponsorshipsServiceInterface {
	const repository = new DrizzleSponsorshipRepository(database);
	return new SponsorshipsService(repository);
}
