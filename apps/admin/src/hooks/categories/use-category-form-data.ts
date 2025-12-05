"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/eden";

interface ComboboxOption {
	value: string;
	label: string;
}

export function useCategoryFormData(excludeCategoryId?: string | null) {
	const categories = useQuery({
		queryKey: ["categories", "default"],
		queryFn: async () => {
			const { data, error } = await api.v1.categories.get({
				query: { limit: 10 },
			});
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch categories");
			return data;
		},
	});

	const categoryOptions: ComboboxOption[] =
		categories.data?.items
			.filter((cat) => cat.id !== excludeCategoryId)
			.map((cat) => ({
				value: cat.id,
				label: cat.name,
			})) ?? [];

	return {
		categories: {
			options: categoryOptions,
			isLoading: categories.isLoading,
		},
	};
}

export async function searchCategories(
	search: string,
	excludeCategoryId?: string | null,
): Promise<ComboboxOption[]> {
	const { data, error } = await api.v1.categories.get({
		query: { search, limit: 10 },
	});
	if (error)
		throw new Error(error.value.message ?? "Failed to search categories");
	return (
		data?.items
			.filter((cat) => cat.id !== excludeCategoryId)
			.map((cat) => ({
				value: cat.id,
				label: cat.name,
			})) ?? []
	);
}
