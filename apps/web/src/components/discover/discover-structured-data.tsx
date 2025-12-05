import type { ToolWithSponsorship } from "@missingstack/api/types";
import { StructuredData } from "~/components/structured-data";
import { breadcrumb, itemList } from "~/lib/seo";

interface DiscoverStructuredDataProps {
	featuredTools: ToolWithSponsorship[];
	totalTools: number;
}

export function DiscoverStructuredData({
	featuredTools,
	totalTools,
}: DiscoverStructuredDataProps) {
	return (
		<>
			<StructuredData
				data={breadcrumb([
					{ name: "Home", url: "/" },
					{ name: "Discover", url: "/discover" },
				])}
			/>
			<StructuredData
				data={itemList({
					name: "Discoverable Tools",
					description: `Explore ${totalTools}+ curated tools. Search and filter by category, pricing, platform, and tags.`,
					items: featuredTools.slice(0, 12).map((tool) => ({
						name: tool.name,
						url: `/tools/${tool.slug}`,
					})),
				})}
			/>
		</>
	);
}
