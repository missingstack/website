"use client";

import { SidebarTrigger } from "~/components/ui/sidebar";

export function AdminHeader() {
	return (
		<header className="flex h-16 shrink-0 items-center gap-2 border-border border-b px-4">
			<SidebarTrigger className="-ml-1" />
			<div className="flex flex-1 items-center gap-2">
				<h1 className="font-semibold text-lg">Admin Dashboard</h1>
			</div>
		</header>
	);
}
