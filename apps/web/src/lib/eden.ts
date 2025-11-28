import { treaty } from "@elysiajs/eden";
import type { App } from "~/app/api/v1/[[...slugs]]/route";

// Get the base URL from environment or use deployment-aware fallbacks
const getBaseUrl = () => {
	// Client-side: always use the current origin so Vercel preview URLs "just work"
	if (typeof window !== "undefined") {
		return window.location.origin;
	}

	// Server-side:
	// 1. Allow explicit override (use this if your API is on a different domain)
	if (process.env.NEXT_PUBLIC_API_URL) {
		return process.env.NEXT_PUBLIC_API_URL;
	}

	// 2. On Vercel, derive from the deployment URL (works for previews and production)
	// VERCEL_URL is something like "my-app-git-feature-123.vercel.app"
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}

	// 3. Local fallback – assume the Next app is serving the API
	const port = process.env.PORT ?? "3000";
	return `http://localhost:${port}`;
};

// This requires .api to enter /api prefix
export const api = treaty<App>(getBaseUrl()).api;
