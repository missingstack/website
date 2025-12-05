"use client";

import type { UseFormReturn } from "react-hook-form";
import { Combobox } from "~/components/ui/combobox";
import { Field, FieldLabel } from "~/components/ui/field";
import { searchStacks, useStackFormData } from "~/hooks/stacks";
import type { StackFormValues } from "../shared/stack-form-schema";

interface StackParentFieldProps {
	form: UseFormReturn<StackFormValues>;
	excludeStackId?: string | null;
}

export function StackParentField({
	form,
	excludeStackId,
}: StackParentFieldProps) {
	const { stacks } = useStackFormData(excludeStackId);
	const parentId = form.watch("parentId");

	return (
		<Field>
			<FieldLabel htmlFor="parent">Parent Stack</FieldLabel>
			<Combobox
				options={stacks.options}
				selectedValues={parentId ? [parentId as string] : []}
				onSelectedValuesChange={(values) =>
					form.setValue("parentId", values[0] || "")
				}
				placeholder="Select parent stack (optional)"
				searchPlaceholder="Search stacks..."
				searchFn={(search) => searchStacks(search, excludeStackId)}
				defaultLimit={10}
			/>
		</Field>
	);
}
