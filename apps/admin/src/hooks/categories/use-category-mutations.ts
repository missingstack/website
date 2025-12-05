"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "~/lib/eden";

export function useDeleteCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await api.v1.categories({ id }).delete();
			if (error)
				throw new Error(error.value.message ?? "Failed to delete category");
		},
		onSuccess: () => {
			toast.success("Category deleted successfully");
			queryClient.resetQueries({ queryKey: ["adminCategories"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete category");
		},
	});
}

interface CreateCategoryData {
	slug: string;
	name: string;
	description?: string;
	icon: string;
	parentId?: string;
	weight?: number;
}

export function useCreateCategory() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateCategoryData) => {
			const { error } = await api.v1.categories.post({
				slug: data.slug,
				name: data.name,
				description: data.description || undefined,
				icon: data.icon,
				parentId: data.parentId || undefined,
				weight: data.weight ?? 0,
			});

			if (error) {
				throw new Error(error.value.message ?? "Failed to create category");
			}
		},
		onSuccess: () => {
			toast.success("Category created successfully!");
			queryClient.resetQueries({ queryKey: ["adminCategories"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create category");
		},
	});
}

interface UpdateCategoryData {
	slug: string;
	name: string;
	description?: string;
	icon: string;
	parentId?: string;
	weight?: number;
}

export function useUpdateCategory(categoryId: string | null) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateCategoryData) => {
			if (!categoryId) throw new Error("Category ID is required");

			const { error } = await api.v1.categories({ id: categoryId }).put({
				slug: data.slug,
				name: data.name,
				description: data.description || undefined,
				icon: data.icon,
				parentId: data.parentId || undefined,
				weight: data.weight,
			});

			if (error) {
				throw new Error(error.value.message ?? "Failed to update category");
			}
		},
		onSuccess: () => {
			toast.success("Category updated successfully!");
			queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
			if (categoryId) {
				queryClient.invalidateQueries({ queryKey: ["category", categoryId] });
			}
			queryClient.invalidateQueries({ queryKey: ["categories"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update category");
		},
	});
}
