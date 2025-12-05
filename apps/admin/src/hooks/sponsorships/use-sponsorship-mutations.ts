"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "~/lib/eden";

export function useDeleteSponsorship() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await api.v1.sponsorships({ id }).delete();
			if (error)
				throw new Error(error.value.message ?? "Failed to delete sponsorship");
		},
		onSuccess: () => {
			toast.success("Sponsorship deleted successfully");
			queryClient.resetQueries({ queryKey: ["adminSponsorships"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete sponsorship");
		},
	});
}

interface CreateSponsorshipData {
	toolId: string;
	tier: "basic" | "premium" | "enterprise";
	startDate: string; // ISO string
	endDate: string; // ISO string
	isActive: boolean;
	priorityWeight: number;
	paymentStatus: "pending" | "completed" | "failed" | "refunded";
}

export function useCreateSponsorship() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateSponsorshipData) => {
			const { error } = await api.v1.sponsorships.post({
				toolId: data.toolId,
				tier: data.tier,
				startDate: data.startDate,
				endDate: data.endDate,
				isActive: data.isActive,
				priorityWeight: data.priorityWeight,
				paymentStatus: data.paymentStatus,
			});

			if (error) {
				throw new Error(error.value.message ?? "Failed to create sponsorship");
			}
		},
		onSuccess: () => {
			toast.success("Sponsorship created successfully!");
			queryClient.resetQueries({ queryKey: ["adminSponsorships"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create sponsorship");
		},
	});
}

interface UpdateSponsorshipData {
	toolId: string;
	tier: "basic" | "premium" | "enterprise";
	startDate: string; // ISO string
	endDate: string; // ISO string
	isActive: boolean;
	priorityWeight: number;
	paymentStatus: "pending" | "completed" | "failed" | "refunded";
}

export function useUpdateSponsorship(sponsorshipId: string | null) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateSponsorshipData) => {
			if (!sponsorshipId) throw new Error("Sponsorship ID is required");

			const { error } = await api.v1.sponsorships({ id: sponsorshipId }).put({
				toolId: data.toolId,
				tier: data.tier,
				startDate: data.startDate,
				endDate: data.endDate,
				isActive: data.isActive,
				priorityWeight: data.priorityWeight,
				paymentStatus: data.paymentStatus,
			});

			if (error) {
				throw new Error(error.value.message ?? "Failed to update sponsorship");
			}
		},
		onSuccess: () => {
			toast.success("Sponsorship updated successfully!");
			queryClient.resetQueries({ queryKey: ["adminSponsorships"] });
			if (sponsorshipId) {
				queryClient.resetQueries({ queryKey: ["sponsorship", sponsorshipId] });
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update sponsorship");
		},
	});
}
