"use client";

import { Plus } from "lucide-react";
import { Suspense, useState } from "react";
import { NewSponsorshipForm } from "~/components/sponsorships/sponsorship-form/new-sponsorship-form";
import { SponsorshipsTable } from "~/components/sponsorships/sponsorships-table";
import { TableSkeleton } from "~/components/table-skeleton";
import { Button } from "~/components/ui/button";

export default function AdminSponsorshipsPage() {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	return (
		<div className="flex flex-1 flex-col gap-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-2xl tracking-tight">Sponsorships</h2>
					<p className="text-muted-foreground text-sm">
						Manage tool sponsorships and maximize revenue
					</p>
				</div>
				<Button onClick={() => setIsDrawerOpen(true)}>
					<Plus className="mr-2 h-4 w-4" />
					New Sponsorship
				</Button>
			</div>
			<Suspense fallback={<TableSkeleton columnCount={8} />}>
				<SponsorshipsTable />
			</Suspense>
			<Suspense fallback={null}>
				<NewSponsorshipForm
					open={isDrawerOpen}
					onOpenChange={setIsDrawerOpen}
				/>
			</Suspense>
		</div>
	);
}
