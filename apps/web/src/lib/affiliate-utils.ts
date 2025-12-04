/**
 * Adds UTM parameters to an affiliate URL
 * @param affiliateUrl - The affiliate URL to add UTM parameters to
 * @returns The URL with UTM parameters added
 */
export function addUtmParameters(affiliateUrl: string): string {
	try {
		const url = new URL(affiliateUrl);
		url.searchParams.set("utm_source", "missingstack.com");
		return url.toString();
	} catch {
		// If URL parsing fails, return original URL
		return affiliateUrl;
	}
}

/**
 * Gets the tool URL to use (affiliate link with UTM or regular website)
 * @param tool - Tool object with website and optional affiliateUrl
 * @returns The URL to use for the tool
 */
export function getToolUrl(tool: {
	website?: string | null;
	affiliateUrl?: string | null;
}): string | null {
	if (tool.affiliateUrl) {
		return addUtmParameters(tool.affiliateUrl);
	}
	return tool.website ?? null;
}
