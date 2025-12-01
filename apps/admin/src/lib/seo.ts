import type { Metadata } from "next";
import { config } from "./site-config";

export interface SEOProps {
	title?: string;
	description?: string;
	image?: string;
	url?: string;
	type?: "website" | "article";
	noindex?: boolean;
}

function getOGImageUrl(title?: string, description?: string): URL {
	const ogUrl = new URL("/api/og", config.url);
	if (title) ogUrl.searchParams.set("title", title);
	if (description) ogUrl.searchParams.set("description", description);
	return ogUrl;
}

export function generateSEOMetadata({
	title,
	description,
	image,
	url,
	type = "website",
	noindex = false,
}: SEOProps): Metadata {
	const siteTitle = title ? `${title}` : config.title;
	const siteDescription = description || config.description;
	const siteUrl = url ? new URL(url, config.url) : new URL(config.url);
	const siteImage = image
		? new URL(image, config.url)
		: getOGImageUrl(title || config.title, description || config.description);

	return {
		title: siteTitle,
		description: siteDescription,
		metadataBase: new URL(config.url),
		alternates: {
			canonical: siteUrl,
		},
		openGraph: {
			title: siteTitle,
			description: siteDescription,
			url: siteUrl,
			siteName: config.title,
			images: [
				{
					url: siteImage,
					width: 1200,
					height: 630,
					alt: title || config.title,
				},
			],
			locale: config.locale,
			type,
		},
		twitter: {
			card: "summary_large_image",
			title: siteTitle,
			description: siteDescription,
			images: [siteImage.toString()],
		},
		robots: {
			index: !noindex,
			follow: !noindex,
		},
	};
}

function toAbsoluteUrl(url: string): string {
	return url.startsWith("http") ? url : `${config.url}${url}`;
}

export function breadcrumb(items: Array<{ name: string; url: string }>) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: toAbsoluteUrl(item.url),
		})),
	};
}

export function website() {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: config.title,
		description: config.description,
		url: config.url,
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${config.url}/discover?q={search_term_string}`,
			},
			"query-input": "required name=search_term_string",
		},
	};
}

export function organization() {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: config.title,
		url: config.url,
		logo: `${config.url}/logo.png`,
	};
}

export function itemList({
	name,
	items,
	description,
}: {
	name: string;
	items: Array<{ name: string; url: string }>;
	description?: string;
}) {
	return {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name,
		...(description && { description }),
		numberOfItems: items.length,
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			url: toAbsoluteUrl(item.url),
		})),
	};
}

export function softwareApplication({
	name,
	description,
	url,
	category,
	platforms,
}: {
	name: string;
	description: string;
	url: string;
	category?: string;
	platforms?: string[];
}) {
	return {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name,
		description,
		url: toAbsoluteUrl(url),
		...(category && { applicationCategory: category }),
		...(platforms && platforms.length > 0 && { operatingSystem: platforms }),
	};
}

export function faqPage(
	questions: Array<{ question: string; answer: string }>,
) {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: questions.map((q) => ({
			"@type": "Question",
			name: q.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: q.answer,
			},
		})),
	};
}
