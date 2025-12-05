"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "~/lib/eden";

export function useDeleteAffiliateLink() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await api.v1["affiliate-links"]({ id }).delete();
			if (error)
				throw new Error(
					error.value.message ?? "Failed to delete affiliate link",
				);
		},
		onSuccess: () => {
			toast.success("Affiliate link deleted successfully");
			queryClient.resetQueries({ queryKey: ["adminAffiliateLinks"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete affiliate link");
		},
	});
}

interface CreateAffiliateLinkData {
	toolId: string;
	affiliateUrl: string;
	commissionRate: number;
	trackingCode?: string;
	isPrimary: boolean;
}

export function useCreateAffiliateLink() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateAffiliateLinkData) => {
			const { error } = await api.v1["affiliate-links"].post({
				toolId: data.toolId,
				affiliateUrl: data.affiliateUrl,
				commissionRate: data.commissionRate,
				trackingCode: data.trackingCode,
				isPrimary: data.isPrimary,
			});

			if (error) {
				throw new Error(
					error.value.message ?? "Failed to create affiliate link",
				);
			}
		},
		onSuccess: () => {
			toast.success("Affiliate link created successfully!");
			queryClient.resetQueries({ queryKey: ["adminAffiliateLinks"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create affiliate link");
		},
	});
}

interface UpdateAffiliateLinkData {
	toolId: string;
	affiliateUrl: string;
	commissionRate: number;
	trackingCode?: string;
	isPrimary: boolean;
}

export function useUpdateAffiliateLink(affiliateLinkId: string | null) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateAffiliateLinkData) => {
			if (!affiliateLinkId) throw new Error("Affiliate link ID is required");

			const { error } = await api.v1["affiliate-links"]({
				id: affiliateLinkId,
			}).put({
				toolId: data.toolId,
				affiliateUrl: data.affiliateUrl,
				commissionRate: data.commissionRate,
				trackingCode: data.trackingCode,
				isPrimary: data.isPrimary,
			});

			if (error) {
				throw new Error(
					error.value.message ?? "Failed to update affiliate link",
				);
			}
		},
		onSuccess: () => {
			toast.success("Affiliate link updated successfully!");
			queryClient.resetQueries({ queryKey: ["adminAffiliateLinks"] });
			if (affiliateLinkId) {
				queryClient.resetQueries({
					queryKey: ["affiliateLink", affiliateLinkId],
				});
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update affiliate link");
		},
	});
}
