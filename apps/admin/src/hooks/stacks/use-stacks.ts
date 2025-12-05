"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/eden";

export function useStacks() {
	return useQuery({
		queryKey: ["adminStacks"],
		queryFn: async () => {
			const { data, error } = await api.v1.stacks.get();
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch stacks");
			if (!data) throw new Error("No data returned from API");
			return Array.isArray(data) ? data : [];
		},
	});
}
