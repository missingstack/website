import { NewsletterService } from "./newsletter.service";
import type { NewsletterServiceInterface } from "./newsletter.types";

export function createNewsletterService(): NewsletterServiceInterface {
	return new NewsletterService();
}
