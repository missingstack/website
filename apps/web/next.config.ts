import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Configure `pageExtensions` to include markdown and MDX files
	pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],

	cacheComponents: true,
	reactCompiler: true,
	reactStrictMode: true,
	typedRoutes: false,

	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**.githubusercontent.com",
			},
		],
	},

	experimental: {
		viewTransition: true,
		turbopackFileSystemCacheForDev: true,
	},

	// Optimize static generation for Vercel builds
	// Increase static page generation timeout to match Vercel's limits
	staticPageGenerationTimeout: 120, // 2 minutes (Vercel allows up to 5 minutes for builds)
};
const withMDX = require("@next/mdx")({
	options: {
		remarkPlugins: [],
		rehypePlugins: [],
	},
});
export default withMDX(nextConfig);
