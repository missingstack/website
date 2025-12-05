"use client";

import type { ToolData } from "@missingstack/api/types";
import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/eden";

export function useTool(toolId: string | null | undefined) {
	return useQuery({
		queryKey: ["tool", toolId],
		queryFn: async () => {
			if (!toolId) return null;
			const { data, error } = await api.v1.tools({ id: toolId }).get();
			if (error) throw new Error(error.value.message ?? "Failed to fetch tool");
			return data as ToolData | null;
		},
		enabled: !!toolId,
	});
}
