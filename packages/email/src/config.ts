export const DEFAULT_FROM =
	process.env.AUTH_EMAIL_FROM ?? "MissingStack <noreply@missingstack.dev>";

export function getResendApiKey(): string {
	const apiKey = process.env.RESEND_API_KEY;
	if (!apiKey)
		throw new Error("RESEND_API_KEY environment variable is required");

	return apiKey;
}
