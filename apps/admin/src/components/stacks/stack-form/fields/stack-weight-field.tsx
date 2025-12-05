"use client";

import type { UseFormReturn } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import type { StackFormValues } from "../shared/stack-form-schema";

interface StackWeightFieldProps {
	form: UseFormReturn<StackFormValues>;
}

export function StackWeightField({ form }: StackWeightFieldProps) {
	return (
		<Field>
			<FieldLabel htmlFor="weight">Weight</FieldLabel>
			<Input
				id="weight"
				type="number"
				{...form.register("weight", {
					valueAsNumber: true,
				})}
				placeholder="0"
			/>
			<FieldError errors={[form.formState.errors.weight]} />
		</Field>
	);
}
