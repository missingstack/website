"use client";

import type { UseFormReturn } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import type { StackFormValues } from "../shared/stack-form-schema";

interface StackBasicFieldsProps {
	form: UseFormReturn<StackFormValues>;
}

export function StackBasicFields({ form }: StackBasicFieldsProps) {
	return (
		<>
			<Field>
				<FieldLabel htmlFor="name">Name *</FieldLabel>
				<Input id="name" {...form.register("name")} placeholder="Stack name" />
				<FieldError errors={[form.formState.errors.name]} />
			</Field>

			<Field>
				<FieldLabel htmlFor="slug">Slug *</FieldLabel>
				<Input id="slug" {...form.register("slug")} placeholder="stack-slug" />
				<FieldError errors={[form.formState.errors.slug]} />
			</Field>

			<Field>
				<FieldLabel htmlFor="description">Description</FieldLabel>
				<Textarea
					id="description"
					{...form.register("description")}
					placeholder="Stack description"
					rows={4}
				/>
				<FieldError errors={[form.formState.errors.description]} />
			</Field>

			<Field>
				<FieldLabel htmlFor="icon">Icon</FieldLabel>
				<Input id="icon" {...form.register("icon")} placeholder="Icon name" />
				<FieldError errors={[form.formState.errors.icon]} />
			</Field>
		</>
	);
}
