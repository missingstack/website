import type { AddContactOptions } from "@missingstack/email";

export type { AddContactOptions };

export interface NewsletterServiceInterface {
	subscribe(options: AddContactOptions): Promise<{
		success: boolean;
	}>;
}
