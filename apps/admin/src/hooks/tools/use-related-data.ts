"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/eden";

export function useRelatedCategories(categoryIds: string[]) {
	return useQuery({
		queryKey: ["categories", categoryIds],
		queryFn: async () => {
			if (categoryIds.length === 0) return [];
			const results = await Promise.all(
				categoryIds.map(async (id) => {
					const { data, error } = await api.v1.categories({ id }).get();
					if (error) return null;
					return data;
				}),
			);
			return results.filter(Boolean);
		},
		enabled: categoryIds.length > 0,
	});
}

export function useRelatedTags(tagIds: string[]) {
	return useQuery({
		queryKey: ["tags", tagIds],
		queryFn: async () => {
			if (tagIds.length === 0) return [];
			const results = await Promise.all(
				tagIds.map(async (id) => {
					const { data, error } = await api.v1.tags({ id }).get();
					if (error) return null;
					return data;
				}),
			);
			return results.filter(Boolean);
		},
		enabled: tagIds.length > 0,
	});
}

export function useRelatedStacks(stackIds: string[]) {
	return useQuery({
		queryKey: ["stacks", stackIds],
		queryFn: async () => {
			if (stackIds.length === 0) return [];
			const results = await Promise.all(
				stackIds.map(async (id) => {
					const { data, error } = await api.v1.stacks({ id }).get();
					if (error) return null;
					return data;
				}),
			);
			return results.filter(Boolean);
		},
		enabled: stackIds.length > 0,
	});
}

export function useRelatedTools(toolIds: string[]) {
	return useQuery({
		queryKey: ["tools", "alternatives", toolIds],
		queryFn: async () => {
			if (toolIds.length === 0) return [];
			const results = await Promise.all(
				toolIds.map(async (id) => {
					const { data, error } = await api.v1.tools({ id }).get();
					if (error) return null;
					return data;
				}),
			);
			return results.filter(Boolean);
		},
		enabled: toolIds.length > 0,
	});
}
