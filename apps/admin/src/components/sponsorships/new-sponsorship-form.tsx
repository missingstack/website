"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Combobox } from "~/components/ui/combobox";
import { DatePicker } from "~/components/ui/date-picker";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "~/components/ui/drawer";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { api } from "~/lib/eden";

// Form schema
const sponsorshipFormSchema = z
	.object({
		toolId: z.string().uuid("Please select a tool"),
		tier: z.enum(["basic", "premium", "enterprise"]),
		startDate: z.date({ message: "Start date is required" }),
		endDate: z.date({ message: "End date is required" }),
		isActive: z.boolean(),
		priorityWeight: z.number().int().min(0),
		paymentStatus: z.enum(["pending", "completed", "failed", "refunded"]),
	})
	.refine(
		(data) => {
			if (data.startDate && data.endDate) {
				return data.endDate > data.startDate;
			}
			return true;
		},
		{
			message: "End date must be after start date",
			path: ["endDate"],
		},
	);

type SponsorshipFormValues = z.infer<typeof sponsorshipFormSchema>;

interface NewSponsorshipFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function NewSponsorshipForm({
	open,
	onOpenChange,
}: NewSponsorshipFormProps) {
	const queryClient = useQueryClient();
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Fetch tools
	const { data: toolsData } = useQuery({
		queryKey: ["tools", "for-sponsorships"],
		queryFn: async () => {
			const { data, error } = await api.v1.tools.get({
				query: { limit: 1000 },
			});
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch tools");
			return data;
		},
	});

	const form = useForm<SponsorshipFormValues>({
		resolver: zodResolver(sponsorshipFormSchema),
		defaultValues: {
			toolId: "",
			tier: "basic",
			startDate: undefined,
			endDate: undefined,
			isActive: true,
			priorityWeight: 0,
			paymentStatus: "pending",
		},
	});

	const onSubmit = async (data: SponsorshipFormValues) => {
		setIsSubmitting(true);
		try {
			// Convert Date objects to ISO datetime strings
			const startDate = data.startDate.toISOString();
			const endDate = data.endDate.toISOString();

			const { error } = await api.v1.sponsorships.post({
				toolId: data.toolId,
				tier: data.tier,
				startDate,
				endDate,
				isActive: data.isActive,
				priorityWeight: data.priorityWeight,
				paymentStatus: data.paymentStatus,
			});

			if (error) {
				throw new Error(error.value.message ?? "Failed to create sponsorship");
			}

			toast.success("Sponsorship created successfully!");
			queryClient.resetQueries({ queryKey: ["adminSponsorships"] });
			form.reset();
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create sponsorship",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const toolOptions =
		toolsData?.items.map((tool) => ({
			value: tool.id,
			label: tool.name,
		})) ?? [];

	// Get today's date for min date constraint
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="right">
			<DrawerContent className="flex h-full flex-col data-[vaul-drawer-direction=right]:max-w-lg! sm:data-[vaul-drawer-direction=right]:max-w-lg!">
				<DrawerHeader className="shrink-0 border-b">
					<DrawerTitle>Create New Sponsorship</DrawerTitle>
					<DrawerDescription>
						Add a new sponsorship for a tool. Fill in all required fields.
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
									<Field>
										<FieldLabel htmlFor="toolId">Tool *</FieldLabel>
										<Combobox
											options={toolOptions}
											value={form.watch("toolId")}
											onValueChange={(value) => form.setValue("toolId", value)}
											placeholder="Select a tool"
											searchPlaceholder="Search tools..."
										/>
										<FieldDescription>
											Select the tool to sponsor
										</FieldDescription>
										<FieldError errors={[form.formState.errors.toolId]} />
									</Field>

									<Field>
										<FieldLabel htmlFor="tier">Tier *</FieldLabel>
										<Select
											value={form.watch("tier")}
											onValueChange={(value) =>
												form.setValue(
													"tier",
													value as SponsorshipFormValues["tier"],
												)
											}
										>
											<SelectTrigger id="tier">
												<SelectValue placeholder="Select tier" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="basic">Basic</SelectItem>
												<SelectItem value="premium">Premium</SelectItem>
												<SelectItem value="enterprise">Enterprise</SelectItem>
											</SelectContent>
										</Select>
										<FieldDescription>
											Sponsorship tier level (basic, premium, enterprise)
										</FieldDescription>
										<FieldError errors={[form.formState.errors.tier]} />
									</Field>

									<div className="grid grid-cols-2 gap-4">
										<Field>
											<FieldLabel htmlFor="startDate">Start Date *</FieldLabel>
											<DatePicker
												date={form.watch("startDate")}
												onDateChange={(date) => {
													if (date) {
														form.setValue("startDate", date);
														// Reset end date if it's before the new start date
														const endDate = form.watch("endDate");
														if (endDate && endDate <= date) {
															form.setValue(
																"endDate",
																undefined as unknown as Date,
															);
														}
													}
												}}
												placeholder="Select start date"
												minDate={today}
											/>
											<FieldError errors={[form.formState.errors.startDate]} />
										</Field>

										<Field>
											<FieldLabel htmlFor="endDate">End Date *</FieldLabel>
											<DatePicker
												date={form.watch("endDate")}
												onDateChange={(date) => {
													if (date) {
														form.setValue("endDate", date);
													}
												}}
												placeholder="Select end date"
												minDate={form.watch("startDate") || today}
											/>
											<FieldDescription>
												Must be after start date
											</FieldDescription>
											<FieldError errors={[form.formState.errors.endDate]} />
										</Field>
									</div>

									<Field>
										<FieldLabel htmlFor="priorityWeight">
											Priority Weight
										</FieldLabel>
										<Input
											id="priorityWeight"
											type="number"
											min="0"
											{...form.register("priorityWeight", {
												valueAsNumber: true,
											})}
											placeholder="0"
										/>
										<FieldDescription>
											Higher values appear first in rankings (default: 0)
										</FieldDescription>
										<FieldError
											errors={[form.formState.errors.priorityWeight]}
										/>
									</Field>

									<Field>
										<FieldLabel htmlFor="paymentStatus">
											Payment Status *
										</FieldLabel>
										<Select
											value={form.watch("paymentStatus")}
											onValueChange={(value) =>
												form.setValue(
													"paymentStatus",
													value as SponsorshipFormValues["paymentStatus"],
												)
											}
										>
											<SelectTrigger id="paymentStatus">
												<SelectValue placeholder="Select payment status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="pending">Pending</SelectItem>
												<SelectItem value="completed">Completed</SelectItem>
												<SelectItem value="failed">Failed</SelectItem>
												<SelectItem value="refunded">Refunded</SelectItem>
											</SelectContent>
										</Select>
										<FieldError
											errors={[form.formState.errors.paymentStatus]}
										/>
									</Field>

									<Field>
										<div className="flex items-center justify-between">
											<div className="space-y-0.5">
												<FieldLabel htmlFor="isActive">Active</FieldLabel>
												<FieldDescription>
													Whether this sponsorship is currently active
												</FieldDescription>
											</div>
											<Switch
												id="isActive"
												checked={form.watch("isActive")}
												onCheckedChange={(checked) =>
													form.setValue("isActive", checked)
												}
											/>
										</div>
										<FieldError errors={[form.formState.errors.isActive]} />
									</Field>
								</FieldGroup>
							</FieldSet>
						</FieldGroup>
					</div>

					<DrawerFooter className="shrink-0 border-t">
						<div className="flex gap-2">
							<DrawerClose asChild>
								<Button type="button" variant="outline" disabled={isSubmitting}>
									Cancel
								</Button>
							</DrawerClose>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creating...
									</>
								) : (
									"Create Sponsorship"
								)}
							</Button>
						</div>
					</DrawerFooter>
				</form>
			</DrawerContent>
		</Drawer>
	);
}
