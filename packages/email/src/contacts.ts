import { getResend } from "./resend-client";
import type {
	AddContactOptions,
	RemoveContactOptions,
	UpdateContactOptions,
} from "./types";

/**
 * Add a contact to Resend
 *
 * @param options - Contact information
 * @returns Promise resolving to Resend contact response
 *
 * @example
 * ```ts
 * await addContact({
 *   email: "user@example.com",
 *   firstName: "John",
 *   lastName: "Doe",
 * });
 * ```
 */
export async function addContact(options: AddContactOptions) {
	const resend = getResend();
	const response = await resend.contacts.create({
		email: options.email,
		firstName: options.firstName,
		lastName: options.lastName,
		unsubscribed: options.unsubscribed ?? false,
	});

	return response;
}

/**
 * Update an existing contact in Resend
 *
 * @param options - Updated contact information
 * @returns Promise resolving to Resend contact response
 *
 * @example
 * ```ts
 * await updateContact({
 *   email: "user@example.com",
 *   firstName: "Jane",
 *   unsubscribed: true,
 * });
 * ```
 */
export async function updateContact(options: UpdateContactOptions) {
	const resend = getResend();
	const response = await resend.contacts.update({
		email: options.email,
		firstName: options.firstName,
		lastName: options.lastName,
		unsubscribed: options.unsubscribed,
	});

	return response;
}

/**
 * Remove a contact from Resend
 *
 * @param options - Contact removal options
 * @returns Promise resolving to Resend deletion response
 *
 * @example
 * ```ts
 * await removeContact({
 *   email: "user@example.com",
 * });
 * ```
 */
export async function removeContact(options: RemoveContactOptions) {
	const resend = getResend();
	const response = await resend.contacts.remove({
		email: options.email,
	});

	return response;
}

/**
 * Get a contact from Resend by email
 *
 * @param email - Contact's email address
 * @returns Promise resolving to contact information
 *
 * @example
 * ```ts
 * const contact = await getContact("user@example.com");
 * ```
 */
export async function getContact(email: string) {
	const resend = getResend();
	const response = await resend.contacts.get({ email });
	return response;
}

/**
 * List contacts from Resend audience
 *
 * @param audienceId - Optional audience ID to filter contacts
 * @returns Promise resolving to list of contacts
 *
 * @example
 * ```ts
 * const contacts = await listContacts();
 * ```
 */
export async function listContacts(audienceId?: string) {
	const resend = getResend();
	const response = await resend.contacts.list({ audienceId });
	return response;
}
