"use client";

import type { UseFormReturn } from "react-hook-form";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import type { ToolFormValues } from "../shared/tool-form-schema";

interface ToolBasicFieldsProps {
	form: UseFormReturn<ToolFormValues>;
}

export function ToolBasicFields({ form }: ToolBasicFieldsProps) {
	return (
		<FieldGroup>
			<Field>
				<FieldLabel htmlFor="name">Name *</FieldLabel>
				<Input id="name" {...form.register("name")} placeholder="Tool name" />
				<FieldError errors={[form.formState.errors.name]} />
			</Field>

			<Field>
				<FieldLabel htmlFor="slug">Slug *</FieldLabel>
				<Input id="slug" {...form.register("slug")} placeholder="tool-slug" />
				<FieldDescription>
					URL-friendly identifier (e.g., "my-awesome-tool")
				</FieldDescription>
				<FieldError errors={[form.formState.errors.slug]} />
			</Field>

			<Field>
				<FieldLabel htmlFor="tagline">Tagline</FieldLabel>
				<Input
					id="tagline"
					{...form.register("tagline")}
					placeholder="Short tagline"
				/>
				<FieldError errors={[form.formState.errors.tagline]} />
			</Field>

			<Field>
				<FieldLabel htmlFor="description">Description *</FieldLabel>
				<Textarea
					id="description"
					{...form.register("description")}
					placeholder="Tool description"
					rows={4}
				/>
				<FieldError errors={[form.formState.errors.description]} />
			</Field>

			<Field>
				<FieldLabel htmlFor="logo">Logo URL *</FieldLabel>
				<Input
					id="logo"
					{...form.register("logo")}
					placeholder="https://example.com/logo.png"
				/>
				<FieldError errors={[form.formState.errors.logo]} />
			</Field>

			<Field>
				<FieldLabel htmlFor="website">Website</FieldLabel>
				<Input
					id="website"
					type="url"
					{...form.register("website")}
					placeholder="https://example.com"
				/>
				<FieldError errors={[form.formState.errors.website]} />
			</Field>
		</FieldGroup>
	);
}
