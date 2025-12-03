import type { AddContactOptions } from "@missingstack/email";
import { addContact } from "@missingstack/email";

import type { NewsletterServiceInterface } from "./newsletter.types";

export class NewsletterService implements NewsletterServiceInterface {
	async subscribe(options: AddContactOptions): Promise<{
		success: boolean;
	}> {
		try {
			const response = await addContact({
				email: options.email,
				firstName: options.firstName,
				lastName: options.lastName,
				unsubscribed: options.unsubscribed ?? false,
			});

			if (response.error) return { success: false };
			return { success: true };
		} catch (_error) {
			return { success: false };
		}
	}
}
