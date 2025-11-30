"use client";

import { useMutation } from "@tanstack/react-query";
import {
	ArrowRight,
	CheckCircle2,
	Gift,
	Loader2,
	Mail,
	Sparkles,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

const BENEFITS = [
	{
		icon: Sparkles,
		title: "Weekly Discoveries",
		description: "Hand-picked tools every Friday",
	},
	{
		icon: Zap,
		title: "Early Access",
		description: "Be first to know about launches",
	},
	{
		icon: Gift,
		title: "Exclusive Deals",
		description: "Special offers from tools",
	},
];

async function subscribeToNewsletter(email: string) {
	const response = await fetch("/api/subscribe", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email }),
	});

	if (!response.ok) {
		const error = await response
			.json()
			.catch(() => ({ message: "Failed to subscribe" }));
		throw new Error(error.message || "Failed to subscribe");
	}

	return response.json();
}

export function NewsletterSection() {
	const [email, setEmail] = useState("");

	const mutation = useMutation({
		mutationFn: subscribeToNewsletter,
		onSuccess: () => {
			setEmail("");
			toast.success("Successfully subscribed!");
		},
		onError: (error) => {
			toast.error(error.message || "Something went wrong. Please try again.");
		},
		onSettled: () => {
			setEmail("");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (email.trim()) {
			mutation.mutate(email.trim());
		}
	};

	return (
		<section className="border-border/50 border-y bg-secondary/40 py-20">
			<div className="mx-auto max-w-7xl px-6">
				<div className="mx-auto max-w-2xl text-center">
					<div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
						<Mail className="h-6 w-6 text-primary" />
					</div>

					<h2 className="mb-3 font-serif text-2xl text-primary md:text-3xl">
						Stay ahead of the curve
					</h2>
					<p className="mb-8 text-muted-foreground">
						Get a curated roundup of the best new tools delivered to your inbox.
						No spam, unsubscribe anytime.
					</p>

					<form
						onSubmit={handleSubmit}
						className="relative mx-auto mb-8 max-w-md"
					>
						<Input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
							className="h-14 w-full rounded-full border border-border bg-white pr-36 pl-5 text-base shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
							required
							disabled={mutation.isPending}
						/>
						<Button
							type="submit"
							disabled={mutation.isPending || !email.trim()}
							className="-translate-y-1/2 absolute top-1/2 right-1.5 flex h-11 items-center gap-2 rounded-full px-6 font-medium text-sm"
						>
							{mutation.isPending ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Subscribing...
								</>
							) : mutation.isSuccess ? (
								<>
									<CheckCircle2 className="h-4 w-4" />
									Subscribed!
								</>
							) : (
								<>
									Subscribe
									<ArrowRight className="h-4 w-4" />
								</>
							)}
						</Button>
					</form>

					{mutation.isError && (
						<p className="mb-4 text-destructive text-sm">
							{mutation.error instanceof Error
								? mutation.error.message
								: "Something went wrong. Please try again."}
						</p>
					)}

					{mutation.isSuccess && (
						<p className="mb-4 text-green-600 text-sm">
							Successfully subscribed! Check your inbox for confirmation.
						</p>
					)}

					<div className="flex flex-wrap justify-center gap-6">
						{BENEFITS.map((benefit) => (
							<div
								key={benefit.title}
								className="flex items-center gap-2 text-muted-foreground text-sm"
							>
								<benefit.icon className="h-4 w-4 text-primary" />
								<span>{benefit.title}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
