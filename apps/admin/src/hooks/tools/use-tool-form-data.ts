"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/eden";

interface ComboboxOption {
	value: string;
	label: string;
}

export function useToolFormData() {
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

	const stacks = useQuery({
		queryKey: ["stacks", "default"],
		queryFn: async () => {
			const { data, error } = await api.v1.stacks.get({});
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch stacks");
			return Array.isArray(data) ? data.slice(0, 10) : [];
		},
	});

	const tags = useQuery({
		queryKey: ["tags", "default"],
		queryFn: async () => {
			const { data, error } = await api.v1.tags.get({});
			if (error) throw new Error(error.value.message ?? "Failed to fetch tags");
			return Array.isArray(data) ? data.slice(0, 10) : [];
		},
	});

	const tools = useQuery({
		queryKey: ["tools", "default"],
		queryFn: async () => {
			const { data, error } = await api.v1.tools.get({
				query: { limit: 10 },
			});
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch tools");
			return data;
		},
	});

	const categoryOptions: ComboboxOption[] =
		categories.data?.items.map((cat) => ({
			value: cat.id,
			label: cat.name,
		})) ?? [];

	const stackOptions: ComboboxOption[] = (
		Array.isArray(stacks.data) ? stacks.data : []
	).map((stack: { id: string; name: string }) => ({
		value: stack.id,
		label: stack.name,
	}));

	const tagOptions: ComboboxOption[] = (
		Array.isArray(tags.data) ? tags.data : []
	).map((tag: { id: string; name: string }) => ({
		value: tag.id,
		label: tag.name,
	}));

	const toolOptions: ComboboxOption[] =
		tools.data?.items.map((tool) => ({
			value: tool.id,
			label: tool.name,
		})) ?? [];

	return {
		categories: {
			options: categoryOptions,
			isLoading: categories.isLoading,
		},
		stacks: {
			options: stackOptions,
			isLoading: stacks.isLoading,
		},
		tags: {
			options: tagOptions,
			isLoading: tags.isLoading,
		},
		tools: {
			options: toolOptions,
			isLoading: tools.isLoading,
		},
	};
}

export async function searchCategories(
	search: string,
): Promise<ComboboxOption[]> {
	const { data, error } = await api.v1.categories.get({
		query: { search, limit: 10 },
	});
	if (error)
		throw new Error(error.value.message ?? "Failed to search categories");
	return (
		data?.items.map((cat) => ({
			value: cat.id,
			label: cat.name,
		})) ?? []
	);
}

export async function searchStacks(search: string): Promise<ComboboxOption[]> {
	const { data, error } = await api.v1.stacks.get({});
	if (error) throw new Error(error.value.message ?? "Failed to search stacks");
	const allStacks = Array.isArray(data) ? data : [];
	const filtered = allStacks
		.filter((stack: { name: string }) =>
			stack.name.toLowerCase().includes(search.toLowerCase()),
		)
		.slice(0, 10);
	return filtered.map((stack: { id: string; name: string }) => ({
		value: stack.id,
		label: stack.name,
	}));
}

export async function searchTags(search: string): Promise<ComboboxOption[]> {
	const { data, error } = await api.v1.tags.get({});
	if (error) throw new Error(error.value.message ?? "Failed to search tags");
	const allTags = Array.isArray(data) ? data : [];
	const filtered = allTags
		.filter((tag: { name: string }) =>
			tag.name.toLowerCase().includes(search.toLowerCase()),
		)
		.slice(0, 10);
	return filtered.map((tag: { id: string; name: string }) => ({
		value: tag.id,
		label: tag.name,
	}));
}

export async function searchTools(search: string): Promise<ComboboxOption[]> {
	const { data, error } = await api.v1.tools.get({
		query: { search, limit: 10 },
	});
	if (error) throw new Error(error.value.message ?? "Failed to search tools");
	return (
		data?.items.map((tool) => ({
			value: tool.id,
			label: tool.name,
		})) ?? []
	);
}
