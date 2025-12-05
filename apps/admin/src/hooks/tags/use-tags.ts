"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/eden";

export function useTags() {
	return useQuery({
		queryKey: ["adminTags"],
		queryFn: async () => {
			const { data, error } = await api.v1.tags.get();
			if (error) throw new Error(error.value.message ?? "Failed to fetch tags");
			if (!data) throw new Error("No data returned from API");
			return Array.isArray(data) ? data : [];
		},
	});
}
