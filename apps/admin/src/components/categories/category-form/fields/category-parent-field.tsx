"use client";

import type { UseFormReturn } from "react-hook-form";
import { Combobox } from "~/components/ui/combobox";
import { Field, FieldLabel } from "~/components/ui/field";
import { searchCategories, useCategoryFormData } from "~/hooks/categories";
import type { CategoryFormValues } from "../shared/category-form-schema";

interface CategoryParentFieldProps {
	form: UseFormReturn<CategoryFormValues>;
	excludeCategoryId?: string | null;
}

export function CategoryParentField({
	form,
	excludeCategoryId,
}: CategoryParentFieldProps) {
	const { categories } = useCategoryFormData(excludeCategoryId);
	const parentId = form.watch("parentId");

	return (
		<Field>
			<FieldLabel htmlFor="parent">Parent Category</FieldLabel>
			<Combobox
				options={categories.options}
				selectedValues={parentId ? [parentId as string] : []}
				onSelectedValuesChange={(values) =>
					form.setValue("parentId", values[0] || "")
				}
				placeholder="Select parent category (optional)"
				searchPlaceholder="Search categories..."
				searchFn={(search) => searchCategories(search, excludeCategoryId)}
				defaultLimit={10}
			/>
		</Field>
	);
}
