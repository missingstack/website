"use client";

import type { UseFormReturn } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import type { CategoryFormValues } from "../shared/category-form-schema";

interface CategoryWeightFieldProps {
	form: UseFormReturn<CategoryFormValues>;
}

export function CategoryWeightField({ form }: CategoryWeightFieldProps) {
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
