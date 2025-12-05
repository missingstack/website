"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { api } from "~/lib/eden";

export function useAffiliateLinkToolMap() {
	const { data: toolsData } = useQuery({
		queryKey: ["tools", "for-affiliate-links"],
		queryFn: async () => {
			const { data, error } = await api.v1.tools.get({
				query: { limit: 1000 },
			});
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch tools");
			return data;
		},
	});

	const toolMap = useMemo(
		() => new Map(toolsData?.items.map((tool) => [tool.id, tool.name]) ?? []),
		[toolsData],
	);

	return toolMap;
}
