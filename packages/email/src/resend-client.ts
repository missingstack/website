import { Resend } from "resend";
import { getResendApiKey } from "./config";

/**
 * Lazy singleton Resend client instance
 * Reused across all email operations for better performance
 * Only initialized when first accessed to avoid build-time errors
 */
let resendInstance: Resend | null = null;

export function getResend(): Resend {
	if (!resendInstance) {
		const apiKey = getResendApiKey();
		// Validate key is not empty before creating client
		if (!apiKey) {
			throw new Error("RESEND_API_KEY environment variable is required");
		}
		resendInstance = new Resend(apiKey);
	}
	return resendInstance;
}
