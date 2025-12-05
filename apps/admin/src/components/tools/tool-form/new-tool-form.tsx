"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "~/components/ui/drawer";
import { FieldGroup, FieldSet } from "~/components/ui/field";
import { useCreateTool } from "~/hooks/tools";
import {
	ToolBasicFields,
	ToolFeaturedField,
	ToolPricingLicenseFields,
	ToolRelationshipFields,
} from "./fields";
import {
	type ToolFormValues,
	defaultToolFormValues,
	toolFormSchema,
} from "./shared/tool-form-schema";

interface NewToolFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function NewToolForm({ open, onOpenChange }: NewToolFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const createMutation = useCreateTool();

	const form = useForm<ToolFormValues>({
		resolver: zodResolver(toolFormSchema),
		defaultValues: defaultToolFormValues,
	});

	const onSubmit = async (data: ToolFormValues) => {
		setIsSubmitting(true);
		try {
			await createMutation.mutateAsync(
				{
					slug: data.slug,
					name: data.name,
					tagline: data.tagline || undefined,
					description: data.description,
					logo: data.logo,
					website: data.website || undefined,
					pricing: data.pricing,
					license: data.license || undefined,
					featured: data.featured,
					categoryIds: data.categoryIds,
					stackIds: data.stackIds,
					tagIds: data.tagIds,
					alternativeIds: data.alternativeIds,
				},
				{
					onSuccess: () => {
						form.reset();
						onOpenChange(false);
					},
				},
			);
		} catch (_error) {
			// Error is handled by the mutation hook
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="right">
			<DrawerContent className="flex h-full flex-col data-[vaul-drawer-direction=right]:max-w-lg! sm:data-[vaul-drawer-direction=right]:max-w-lg!">
				<DrawerHeader className="shrink-0 border-b">
					<DrawerTitle>Create New Tool</DrawerTitle>
					<DrawerDescription>
						Add a new tool to the directory. Fill in all required fields.
					</DrawerDescription>
				</DrawerHeader>

				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex min-h-0 flex-1 flex-col"
				>
					<div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
						<FieldGroup>
							<FieldSet>
								<ToolBasicFields form={form} />
								<ToolPricingLicenseFields form={form} />
							</FieldSet>

							<FieldSet>
								<FieldGroup>
									<ToolRelationshipFields form={form} />
								</FieldGroup>
							</FieldSet>

							<FieldSet>
								<FieldGroup>
									<ToolFeaturedField form={form} />
								</FieldGroup>
							</FieldSet>
						</FieldGroup>
					</div>

					<DrawerFooter className="shrink-0 border-t">
						<Button
							type="submit"
							disabled={isSubmitting || createMutation.isPending}
						>
							{(isSubmitting || createMutation.isPending) && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Create Tool
						</Button>
						<DrawerClose asChild>
							<Button type="button" variant="outline">
								Cancel
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</form>
			</DrawerContent>
		</Drawer>
	);
}
