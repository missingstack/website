"use client";

import type { Tag } from "@missingstack/api/types";
import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/eden";

export function useTag(tagId: string | null | undefined) {
	return useQuery({
		queryKey: ["tag", tagId],
		queryFn: async () => {
			if (!tagId) return null;
			const { data, error } = await api.v1.tags({ id: tagId }).get();
			if (error) throw new Error(error.value.message ?? "Failed to fetch tag");
			return data as Tag | null;
		},
		enabled: !!tagId,
	});
}
