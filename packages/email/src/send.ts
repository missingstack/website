import { render } from "@react-email/render";
import { DEFAULT_FROM } from "./config";
import { getResend } from "./resend-client";
import type { SendEmailOptions } from "./types";

/**
 * Send an email using Resend
 *
 * @param options - Email sending options
 * @returns Promise resolving to Resend email response
 *
 * @example
 * ```ts
 * await sendEmail({
 *   to: "user@example.com",
 *   subject: "Welcome!",
 *   react: <WelcomeEmail name="John" />
 * });
 * ```
 */
export async function sendEmail({
	from = DEFAULT_FROM,
	to,
	subject,
	react,
}: SendEmailOptions) {
	const resend = getResend();
	const html = await render(react);

	const response = await resend.emails.send({
		from,
		to: Array.isArray(to) ? to : [to],
		subject,
		html,
	});

	return response;
}
