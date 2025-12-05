"use client";

import type { UseFormReturn } from "react-hook-form";
import { Combobox } from "~/components/ui/combobox";
import { Field, FieldDescription, FieldLabel } from "~/components/ui/field";
import {
	searchCategories,
	searchStacks,
	searchTags,
	searchTools,
	useToolFormData,
} from "~/hooks/tools";
import type { ToolFormValues } from "../shared/tool-form-schema";

interface ToolRelationshipFieldsProps {
	form: UseFormReturn<ToolFormValues>;
}

export function ToolRelationshipFields({ form }: ToolRelationshipFieldsProps) {
	const { categories, stacks, tags, tools } = useToolFormData();

	return (
		<>
			<Field>
				<FieldLabel htmlFor="categories">Categories</FieldLabel>
				<Combobox
					options={categories.options}
					multiple
					selectedValues={form.watch("categoryIds")}
					onSelectedValuesChange={(values) =>
						form.setValue("categoryIds", values)
					}
					placeholder="Select categories"
					searchPlaceholder="Search categories..."
					searchFn={searchCategories}
					defaultLimit={10}
				/>
			</Field>

			<Field>
				<FieldLabel htmlFor="stacks">Stacks</FieldLabel>
				<Combobox
					options={stacks.options}
					multiple
					selectedValues={form.watch("stackIds")}
					onSelectedValuesChange={(values) => form.setValue("stackIds", values)}
					placeholder="Select stacks"
					searchPlaceholder="Search stacks..."
					searchFn={searchStacks}
					defaultLimit={10}
				/>
			</Field>

			<Field>
				<FieldLabel htmlFor="tags">Tags</FieldLabel>
				<Combobox
					options={tags.options}
					multiple
					selectedValues={form.watch("tagIds")}
					onSelectedValuesChange={(values) => form.setValue("tagIds", values)}
					placeholder="Select tags"
					searchPlaceholder="Search tags..."
					searchFn={searchTags}
					defaultLimit={10}
				/>
			</Field>

			<Field>
				<FieldLabel htmlFor="alternatives">Alternatives</FieldLabel>
				<Combobox
					options={tools.options}
					multiple
					selectedValues={form.watch("alternativeIds")}
					onSelectedValuesChange={(values) =>
						form.setValue("alternativeIds", values)
					}
					placeholder="Select alternative tools"
					searchPlaceholder="Search tools..."
					searchFn={searchTools}
					defaultLimit={10}
				/>
				<FieldDescription>
					Select tools that are alternatives to this tool
				</FieldDescription>
			</Field>
		</>
	);
}
