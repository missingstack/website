"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "~/lib/eden";

export function useDeleteStack() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await api.v1.stacks({ id }).delete();
			if (error)
				throw new Error(error.value.message ?? "Failed to delete stack");
		},
		onSuccess: () => {
			toast.success("Stack deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["adminStacks"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete stack");
		},
	});
}

interface CreateStackData {
	slug: string;
	name: string;
	description?: string;
	icon?: string;
	parentId?: string;
	weight?: number;
}

export function useCreateStack() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateStackData) => {
			const { error } = await api.v1.stacks.post({
				slug: data.slug,
				name: data.name,
				description: data.description || undefined,
				icon: data.icon || undefined,
				parentId: data.parentId || undefined,
				weight: data.weight,
			});

			if (error) {
				throw new Error(error.value.message ?? "Failed to create stack");
			}
		},
		onSuccess: () => {
			toast.success("Stack created successfully!");
			queryClient.invalidateQueries({ queryKey: ["adminStacks"] });
			queryClient.invalidateQueries({ queryKey: ["stacks"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create stack");
		},
	});
}

interface UpdateStackData {
	slug: string;
	name: string;
	description?: string;
	icon?: string;
	parentId?: string;
	weight?: number;
}

export function useUpdateStack(stackId: string | null) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateStackData) => {
			if (!stackId) throw new Error("Stack ID is required");

			const { error } = await api.v1.stacks({ id: stackId }).put({
				slug: data.slug,
				name: data.name,
				description: data.description || undefined,
				icon: data.icon || undefined,
				parentId: data.parentId || undefined,
				weight: data.weight,
			});

			if (error) {
				throw new Error(error.value.message ?? "Failed to update stack");
			}
		},
		onSuccess: () => {
			toast.success("Stack updated successfully!");
			queryClient.invalidateQueries({ queryKey: ["adminStacks"] });
			if (stackId) {
				queryClient.invalidateQueries({ queryKey: ["stack", stackId] });
			}
			queryClient.invalidateQueries({ queryKey: ["stacks"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update stack");
		},
	});
}
