"use client";

import type { Category } from "@missingstack/api/types";
import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/eden";

export function useCategory(categoryId: string | null | undefined) {
	return useQuery({
		queryKey: ["category", categoryId],
		queryFn: async () => {
			if (!categoryId) return null;
			const { data, error } = await api.v1.categories({ id: categoryId }).get();
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch category");
			return data as Category | null;
		},
		enabled: !!categoryId,
	});
}
