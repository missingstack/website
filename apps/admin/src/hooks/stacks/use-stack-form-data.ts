"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/eden";

interface ComboboxOption {
	value: string;
	label: string;
}

export function useStackFormData(excludeStackId?: string | null) {
	const stacks = useQuery({
		queryKey: ["stacks", "default"],
		queryFn: async () => {
			const { data, error } = await api.v1.stacks.get({});
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch stacks");
			return Array.isArray(data) ? data.slice(0, 10) : [];
		},
	});

	const stackOptions: ComboboxOption[] =
		(Array.isArray(stacks.data) ? stacks.data : [])
			.filter((stack: { id: string }) => stack.id !== excludeStackId)
			.map((stack: { id: string; name: string }) => ({
				value: stack.id,
				label: stack.name,
			})) ?? [];

	return {
		stacks: {
			options: stackOptions,
			isLoading: stacks.isLoading,
		},
	};
}

export async function searchStacks(
	search: string,
	excludeStackId?: string | null,
): Promise<ComboboxOption[]> {
	const { data, error } = await api.v1.stacks.get({});
	if (error) throw new Error(error.value.message ?? "Failed to search stacks");
	const allStacks = Array.isArray(data) ? data : [];
	const filtered = allStacks
		.filter(
			(stack: { id: string; name: string }) =>
				stack.id !== excludeStackId &&
				stack.name.toLowerCase().includes(search.toLowerCase()),
		)
		.slice(0, 10);
	return filtered.map((stack: { id: string; name: string }) => ({
		value: stack.id,
		label: stack.name,
	}));
}
