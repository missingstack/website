"use client";

import type { UseFormReturn } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import type { CategoryFormValues } from "../shared/category-form-schema";

interface CategoryBasicFieldsProps {
	form: UseFormReturn<CategoryFormValues>;
}

export function CategoryBasicFields({ form }: CategoryBasicFieldsProps) {
	return (
		<>
			<Field>
				<FieldLabel htmlFor="name">Name *</FieldLabel>
				<Input
					id="name"
					{...form.register("name")}
					placeholder="Category name"
				/>
				<FieldError errors={[form.formState.errors.name]} />
			</Field>

			<Field>
				<FieldLabel htmlFor="slug">Slug *</FieldLabel>
				<Input
					id="slug"
					{...form.register("slug")}
					placeholder="category-slug"
				/>
				<FieldError errors={[form.formState.errors.slug]} />
			</Field>

			<Field>
				<FieldLabel htmlFor="description">Description</FieldLabel>
				<Textarea
					id="description"
					{...form.register("description")}
					placeholder="Category description"
					rows={4}
				/>
				<FieldError errors={[form.formState.errors.description]} />
			</Field>

			<Field>
				<FieldLabel htmlFor="icon">Icon *</FieldLabel>
				<Input
					id="icon"
					{...form.register("icon")}
					placeholder="lucide icon name"
				/>
				<FieldError errors={[form.formState.errors.icon]} />
			</Field>
		</>
	);
}
