"use client";

import {
	BADGE_VARIANT_OPTIONS,
	TAG_TYPE_OPTIONS,
} from "@missingstack/api/constants/enums";
import type { UseFormReturn } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import type { TagFormValues } from "../shared/tag-form-schema";

const tagTypeOptions = TAG_TYPE_OPTIONS;
const badgeVariantOptions = BADGE_VARIANT_OPTIONS;

interface TagTypeColorFieldsProps {
	form: UseFormReturn<TagFormValues>;
}

export function TagTypeColorFields({ form }: TagTypeColorFieldsProps) {
	return (
		<div className="grid grid-cols-2 gap-4">
			<Field>
				<FieldLabel htmlFor="type">Type *</FieldLabel>
				<Select
					value={form.watch("type")}
					onValueChange={(value) =>
						form.setValue("type", value as TagFormValues["type"])
					}
				>
					<SelectTrigger id="type">
						<SelectValue placeholder="Select type" />
					</SelectTrigger>
					<SelectContent>
						{tagTypeOptions.map((option) => (
							<SelectItem key={option} value={option}>
								{option.charAt(0).toUpperCase() + option.slice(1)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<FieldError errors={[form.formState.errors.type]} />
			</Field>

			<Field>
				<FieldLabel htmlFor="color">Color</FieldLabel>
				<Select
					value={form.watch("color") ?? "default"}
					onValueChange={(value) =>
						form.setValue("color", value as TagFormValues["color"])
					}
				>
					<SelectTrigger id="color">
						<SelectValue placeholder="Select color" />
					</SelectTrigger>
					<SelectContent>
						{badgeVariantOptions.map((option) => (
							<SelectItem key={option} value={option}>
								{option.charAt(0).toUpperCase() + option.slice(1)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<FieldError errors={[form.formState.errors.color]} />
			</Field>
		</div>
	);
}
