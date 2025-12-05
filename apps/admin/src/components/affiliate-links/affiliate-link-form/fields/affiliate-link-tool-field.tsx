"use client";

import type { UseFormReturn } from "react-hook-form";
import { Combobox } from "~/components/ui/combobox";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "~/components/ui/field";
import { api } from "~/lib/eden";
import type { AffiliateLinkFormValues } from "../shared/affiliate-link-form-schema";

interface AffiliateLinkToolFieldProps {
	form: UseFormReturn<AffiliateLinkFormValues>;
	toolOptions?: Array<{ value: string; label: string }>;
}

export function AffiliateLinkToolField({
	form,
	toolOptions = [],
}: AffiliateLinkToolFieldProps) {
	// Search function for API-based searching
	const searchTools = async (search: string) => {
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
	};

	return (
		<Field>
			<FieldLabel htmlFor="toolId">Tool *</FieldLabel>
			<Combobox
				options={toolOptions}
				value={form.watch("toolId")}
				onValueChange={(value) => form.setValue("toolId", value)}
				placeholder="Select a tool"
				searchPlaceholder="Search tools..."
				searchFn={searchTools}
				defaultLimit={10}
			/>
			<FieldDescription>
				Select the tool for this affiliate link
			</FieldDescription>
			<FieldError errors={[form.formState.errors.toolId]} />
		</Field>
	);
}
