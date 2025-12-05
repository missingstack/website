"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "~/lib/eden";

export function useDeleteTag() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await api.v1.tags({ id }).delete();
			if (error) throw new Error(error.value.message ?? "Failed to delete tag");
		},
		onSuccess: () => {
			toast.success("Tag deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["adminTags"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete tag");
		},
	});
}

interface CreateTagData {
	slug: string;
	name: string;
	type: string;
	color?: string;
}

export function useCreateTag() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateTagData) => {
			const { error } = await api.v1.tags.post({
				slug: data.slug,
				name: data.name,
				type: data.type,
				color: data.color ?? "default",
			});

			if (error) {
				throw new Error(error.value.message ?? "Failed to create tag");
			}
		},
		onSuccess: () => {
			toast.success("Tag created successfully!");
			queryClient.invalidateQueries({ queryKey: ["adminTags"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create tag");
		},
	});
}

interface UpdateTagData {
	slug: string;
	name: string;
	type: string;
	color?: string;
}

export function useUpdateTag(tagId: string | null) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateTagData) => {
			if (!tagId) throw new Error("Tag ID is required");

			const { error } = await api.v1.tags({ id: tagId }).put({
				slug: data.slug,
				name: data.name,
				type: data.type,
				color: data.color,
			});

			if (error) {
				throw new Error(error.value.message ?? "Failed to update tag");
			}
		},
		onSuccess: () => {
			toast.success("Tag updated successfully!");
			queryClient.invalidateQueries({ queryKey: ["adminTags"] });
			if (tagId) {
				queryClient.invalidateQueries({ queryKey: ["tag", tagId] });
			}
			queryClient.invalidateQueries({ queryKey: ["tags"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update tag");
		},
	});
}
