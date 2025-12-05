"use client";

import type { UseFormReturn } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import type { TagFormValues } from "../shared/tag-form-schema";

interface TagBasicFieldsProps {
	form: UseFormReturn<TagFormValues>;
}

export function TagBasicFields({ form }: TagBasicFieldsProps) {
	return (
		<>
			<Field>
				<FieldLabel htmlFor="name">Name *</FieldLabel>
				<Input id="name" {...form.register("name")} placeholder="Tag name" />
				<FieldError errors={[form.formState.errors.name]} />
			</Field>

			<Field>
				<FieldLabel htmlFor="slug">Slug *</FieldLabel>
				<Input id="slug" {...form.register("slug")} placeholder="tag-slug" />
				<FieldError errors={[form.formState.errors.slug]} />
			</Field>
		</>
	);
}
