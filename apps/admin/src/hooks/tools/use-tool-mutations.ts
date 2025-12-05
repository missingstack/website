"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "~/lib/eden";

export function useDeleteTool() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await api.v1.tools({ id }).delete();
			if (error)
				throw new Error(error.value.message ?? "Failed to delete tool");
		},
		onSuccess: () => {
			toast.success("Tool deleted successfully");
			queryClient.resetQueries({ queryKey: ["adminTools"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete tool");
		},
	});
}

interface CreateToolData {
	slug: string;
	name: string;
	tagline?: string;
	description: string;
	logo: string;
	website?: string;
	pricing: string;
	license?: string;
	featured: boolean;
	categoryIds: string[];
	stackIds: string[];
	tagIds: string[];
	alternativeIds: string[];
}

export function useCreateTool() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateToolData) => {
			const { error } = await api.v1.tools.post({
				slug: data.slug,
				name: data.name,
				tagline: data.tagline || undefined,
				description: data.description,
				logo: data.logo,
				website: data.website || undefined,
				pricing: data.pricing,
				license: data.license || undefined,
				featured: data.featured,
				categoryIds: data.categoryIds,
				stackIds: data.stackIds,
				tagIds: data.tagIds,
				alternativeIds: data.alternativeIds,
			});

			if (error) {
				throw new Error(error.value.message ?? "Failed to create tool");
			}
		},
		onSuccess: () => {
			toast.success("Tool created successfully!");
			queryClient.resetQueries({ queryKey: ["adminTools"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create tool");
		},
	});
}

interface UpdateToolData {
	slug: string;
	name: string;
	tagline?: string;
	description: string;
	logo: string;
	website?: string;
	pricing: string;
	license?: string;
	featured: boolean;
	categoryIds: string[];
	stackIds: string[];
	tagIds: string[];
	alternativeIds: string[];
}

export function useUpdateTool(toolId: string | null) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateToolData) => {
			if (!toolId) throw new Error("Tool ID is required");

			const { error } = await api.v1.tools({ id: toolId }).put({
				slug: data.slug,
				name: data.name,
				tagline: data.tagline || undefined,
				description: data.description,
				logo: data.logo,
				website: data.website || undefined,
				pricing: data.pricing,
				license: data.license || undefined,
				featured: data.featured,
				categoryIds: data.categoryIds,
				stackIds: data.stackIds,
				tagIds: data.tagIds,
				alternativeIds: data.alternativeIds,
			});

			if (error) {
				throw new Error(error.value.message ?? "Failed to update tool");
			}
		},
		onSuccess: () => {
			toast.success("Tool updated successfully!");
			queryClient.invalidateQueries({ queryKey: ["adminTools"] });
			if (toolId) {
				queryClient.invalidateQueries({ queryKey: ["tool", toolId] });
			}
			queryClient.invalidateQueries({ queryKey: ["tools"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update tool");
		},
	});
}
