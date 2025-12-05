"use client";

import type { UseFormReturn } from "react-hook-form";
import { Field, FieldLabel } from "~/components/ui/field";
import { Switch } from "~/components/ui/switch";
import type { ToolFormValues } from "../shared/tool-form-schema";

interface ToolFeaturedFieldProps {
	form: UseFormReturn<ToolFormValues>;
}

export function ToolFeaturedField({ form }: ToolFeaturedFieldProps) {
	return (
		<Field orientation="horizontal">
			<Switch
				id="featured"
				checked={form.watch("featured")}
				onCheckedChange={(checked) => form.setValue("featured", checked)}
			/>
			<FieldLabel htmlFor="featured" className="font-normal">
				Featured
			</FieldLabel>
		</Field>
	);
}
