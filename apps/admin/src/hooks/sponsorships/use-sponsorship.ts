"use client";

import type { ToolSponsorship } from "@missingstack/api/types";
import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/eden";

export function useSponsorship(sponsorshipId: string | null | undefined) {
	return useQuery({
		queryKey: ["sponsorship", sponsorshipId],
		queryFn: async () => {
			if (!sponsorshipId) return null;
			const { data, error } = await api.v1
				.sponsorships({ id: sponsorshipId })
				.get();
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch sponsorship");
			return data as ToolSponsorship | null;
		},
		enabled: !!sponsorshipId,
	});
}
