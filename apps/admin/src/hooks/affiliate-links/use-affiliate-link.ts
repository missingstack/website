"use client";

import type { ToolAffiliateLink } from "@missingstack/api/features/affiliate-links";
import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/eden";

export function useAffiliateLink(affiliateLinkId: string | null | undefined) {
	return useQuery({
		queryKey: ["affiliateLink", affiliateLinkId],
		queryFn: async () => {
			if (!affiliateLinkId) return null;
			const { data, error } = await api.v1["affiliate-links"]({
				id: affiliateLinkId,
			}).get();
			if (error)
				throw new Error(
					error.value.message ?? "Failed to fetch affiliate link",
				);
			return data as ToolAffiliateLink | null;
		},
		enabled: !!affiliateLinkId,
	});
}
