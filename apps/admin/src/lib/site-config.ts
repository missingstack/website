import { Space_Grotesk, Space_Mono } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
	variable: "--font-space-grotesk",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
	variable: "--font-space-mono",
	subsets: ["latin"],
	weight: ["400", "700"],
});

export const config = {
	url: "https://missingstack.com",
	title: "Missing stack",
	description:
		"A curated directory of the tools for developers, builders and entrepreneurs. Build your modern product stack with awesome tools",
	locale: "en_US",
	keywords: ["Missing Stack", "AI tools directory", "SaaS tools"],
	fonts: {
		spaceGrotesk,
		spaceMono,
	},
};

export type SiteConfig = typeof config;
