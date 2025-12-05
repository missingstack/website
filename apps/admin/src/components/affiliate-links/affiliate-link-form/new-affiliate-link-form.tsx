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
import {
	useAffiliateLinkFormData,
	useCreateAffiliateLink,
} from "~/hooks/affiliate-links";
import {
	AffiliateLinkCommissionField,
	AffiliateLinkPrimaryField,
	AffiliateLinkToolField,
	AffiliateLinkTrackingField,
	AffiliateLinkUrlField,
} from "./fields";
import {
	type AffiliateLinkFormValues,
	affiliateLinkFormSchema,
	defaultAffiliateLinkFormValues,
} from "./shared/affiliate-link-form-schema";

interface NewAffiliateLinkFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function NewAffiliateLinkForm({
	open,
	onOpenChange,
}: NewAffiliateLinkFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toolOptions } = useAffiliateLinkFormData();
	const createMutation = useCreateAffiliateLink();

	const form = useForm<AffiliateLinkFormValues>({
		resolver: zodResolver(affiliateLinkFormSchema),
		defaultValues: defaultAffiliateLinkFormValues,
	});

	const onSubmit = async (data: AffiliateLinkFormValues) => {
		setIsSubmitting(true);
		try {
			await createMutation.mutateAsync(
				{
					toolId: data.toolId,
					affiliateUrl: data.affiliateUrl,
					commissionRate: data.commissionRate,
					trackingCode: data.trackingCode || undefined,
					isPrimary: data.isPrimary,
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
					<DrawerTitle>Create New Affiliate Link</DrawerTitle>
					<DrawerDescription>
						Add a new affiliate link for a tool. Fill in all required fields.
					</DrawerDescription>
				</DrawerHeader>

				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex min-h-0 flex-1 flex-col"
				>
					<div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
						<FieldGroup>
							<FieldSet>
								<FieldGroup>
									<AffiliateLinkToolField
										form={form}
										toolOptions={toolOptions}
									/>
									<AffiliateLinkUrlField form={form} />
									<AffiliateLinkCommissionField form={form} />
									<AffiliateLinkTrackingField form={form} />
									<AffiliateLinkPrimaryField form={form} />
								</FieldGroup>
							</FieldSet>
						</FieldGroup>
					</div>

					<DrawerFooter className="shrink-0 border-t">
						<div className="flex gap-2">
							<DrawerClose asChild>
								<Button
									type="button"
									variant="outline"
									disabled={isSubmitting || createMutation.isPending}
								>
									Cancel
								</Button>
							</DrawerClose>
							<Button
								type="submit"
								disabled={isSubmitting || createMutation.isPending}
							>
								{(isSubmitting || createMutation.isPending) && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Create Affiliate Link
							</Button>
						</div>
					</DrawerFooter>
				</form>
			</DrawerContent>
		</Drawer>
	);
}
