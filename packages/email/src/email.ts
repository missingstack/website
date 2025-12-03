/**
 * @missingstack/email - Modular and composable email package
 *
 * Main entry point that exports all email functionality.
 * You can import from specific modules for better tree-shaking:
 * - @missingstack/email/send - Email sending
 * - @missingstack/email/contacts - Contact management
 * - @missingstack/email/types - TypeScript types
 * - @missingstack/email/config - Configuration
 */

export { DEFAULT_FROM, getResendApiKey } from "./config";
export {
	addContact,
	getContact,
	listContacts,
	removeContact,
	updateContact,
} from "./contacts";
export { sendEmail } from "./send";
export type {
	AddContactOptions,
	RemoveContactOptions,
	SendEmailOptions,
	UpdateContactOptions,
} from "./types";
