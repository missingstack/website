"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/eden";

export function useAffiliateLinkFormData() {
	const { data: toolsData } = useQuery({
		queryKey: ["tools", "default"],
		queryFn: async () => {
			const { data, error } = await api.v1.tools.get({
				query: { limit: 10 },
			});
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch tools");
			return data;
		},
	});

	const toolOptions =
		toolsData?.items.map((tool) => ({
			value: tool.id,
			label: tool.name,
		})) ?? [];

	return {
		toolOptions,
	};
}
