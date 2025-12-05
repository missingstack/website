"use client";

import type { Stack } from "@missingstack/api/types";
import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/eden";

export function useStack(stackId: string | null | undefined) {
	return useQuery({
		queryKey: ["stack", stackId],
		queryFn: async () => {
			if (!stackId) return null;
			const { data, error } = await api.v1.stacks({ id: stackId }).get();
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch stack");
			return data as Stack | null;
		},
		enabled: !!stackId,
	});
}
