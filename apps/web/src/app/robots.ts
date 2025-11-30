import type { MetadataRoute } from "next";
import { config } from "~/lib/site-config";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = config.url;
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/api/", "/_next/"],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
