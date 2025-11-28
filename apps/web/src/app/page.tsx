"use client";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "~/utils/trpc";

export default function Home() {
	const healthCheck = useQuery(trpc.healthCheck.queryOptions());
	return (
		<div className="container max-w-3xl px-4 py-2">{healthCheck.data}</div>
	);
}
