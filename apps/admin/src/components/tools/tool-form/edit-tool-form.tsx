"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
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
import { useTool, useUpdateTool } from "~/hooks/tools";
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

interface EditToolFormProps {
	toolId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditToolForm({
	toolId,
	open,
	onOpenChange,
}: EditToolFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { data: toolData, isLoading: isLoadingTool } = useTool(toolId);
	const updateMutation = useUpdateTool(toolId);

	const form = useForm<ToolFormValues>({
		resolver: zodResolver(toolFormSchema),
		defaultValues: defaultToolFormValues,
	});

	useEffect(() => {
		if (!open) {
			form.reset(defaultToolFormValues);
		}
	}, [open, form]);

	useEffect(() => {
		if (toolData && open) {
			form.reset({
				slug: toolData.slug,
				name: toolData.name,
				tagline: toolData.tagline || "",
				description: toolData.description,
				logo: toolData.logo,
				website: toolData.website || "",
				pricing: toolData.pricing as ToolFormValues["pricing"],
				license: (toolData.license as ToolFormValues["license"]) || undefined,
				featured: toolData.featured ?? false,
				categoryIds: toolData.categoryIds || [],
				stackIds: toolData.stackIds || [],
				tagIds: toolData.tagIds || [],
				alternativeIds: toolData.alternativeIds || [],
			});
		}
	}, [toolData, open, form]);

	const onSubmit = async (data: ToolFormValues) => {
		if (!toolId) return;

		setIsSubmitting(true);
		try {
			await updateMutation.mutateAsync(
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
					<DrawerTitle>Tool Details</DrawerTitle>
					<DrawerDescription>
						View and edit tool information. All fields are editable.
					</DrawerDescription>
				</DrawerHeader>

				{isLoadingTool ? (
					<div className="flex flex-1 items-center justify-center">
						<div className="flex flex-col items-center gap-2">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							<span className="text-muted-foreground text-sm">
								Loading tool details...
							</span>
						</div>
					</div>
				) : (
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex min-h-0 flex-1 flex-col"
					>
						<div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
							<FieldGroup>
								<FieldSet>
									<ToolBasicFields form={form} />
									<ToolPricingLicenseFields form={form} toolId={toolId} />
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
								disabled={isSubmitting || updateMutation.isPending}
							>
								{(isSubmitting || updateMutation.isPending) && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Update Tool
							</Button>
							<DrawerClose asChild>
								<Button type="button" variant="outline">
									Cancel
								</Button>
							</DrawerClose>
						</DrawerFooter>
					</form>
				)}
			</DrawerContent>
		</Drawer>
	);
}
