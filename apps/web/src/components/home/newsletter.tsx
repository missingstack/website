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
import { api } from "~/lib/eden";

// NewsletterBenefits Component
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
] as const;

function NewsletterBenefits() {
	return (
		<div className="flex flex-wrap justify-center gap-4 sm:gap-6">
			{BENEFITS.map((benefit) => (
				<div
					key={benefit.title}
					className="flex items-center gap-1.5 text-muted-foreground text-xs transition-transform duration-200 hover:scale-105 sm:gap-2 sm:text-sm"
				>
					<benefit.icon className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
					<span>{benefit.title}</span>
				</div>
			))}
		</div>
	);
}

// NewsletterForm Component
async function subscribeToNewsletter(email: string) {
	const { data, error } = await api.v1.newsletter.post({
		email,
	});

	if (error) {
		const errorMessage = error.value?.message || "Failed to subscribe";
		throw new Error(errorMessage);
	}

	if (!data.success) {
		throw new Error("Failed to subscribe");
	}

	return data;
}

function NewsletterForm() {
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
		<>
			<form
				onSubmit={handleSubmit}
				className="relative mx-auto mb-6 max-w-md sm:mb-8"
			>
				<Input
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="you@example.com"
					className="h-12 w-full rounded-full border border-border bg-white pr-28 pl-4 text-sm shadow-sm transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:h-14 sm:pr-36 sm:pl-5 sm:text-base"
					required
					disabled={mutation.isPending}
				/>
				<Button
					type="submit"
					disabled={mutation.isPending || !email.trim()}
					className="-translate-y-1/2 absolute top-1/2 right-1.5 flex h-9 min-h-[36px] items-center gap-1.5 rounded-full px-4 font-medium text-xs transition-all duration-200 hover:scale-105 active:scale-95 sm:h-11 sm:gap-2 sm:px-6 sm:text-sm"
				>
					{mutation.isPending ? (
						<>
							<Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
							<span className="hidden sm:inline">Subscribing...</span>
							<span className="sm:hidden">...</span>
						</>
					) : mutation.isSuccess ? (
						<>
							<CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
							<span className="hidden sm:inline">Subscribed!</span>
							<span className="sm:hidden">Done</span>
						</>
					) : (
						<>
							<span>Subscribe</span>
							<ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 sm:h-4 sm:w-4" />
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
				<p className="mb-4 text-green-600 text-sm">Successfully subscribed!</p>
			)}
		</>
	);
}

// Main NewsletterSection Component
export function NewsletterSection() {
	return (
		<section className="border-border/50 border-y bg-secondary/40 py-12 sm:py-16 lg:py-20">
			<div className="mx-auto max-w-7xl px-4 sm:px-6">
				<div className="mx-auto max-w-2xl text-center">
					<div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-200 hover:scale-110 sm:mb-5 sm:h-12 sm:w-12">
						<Mail className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
					</div>

					<h2 className="mb-2 text-primary text-xl leading-tight sm:mb-3 sm:text-2xl md:text-3xl">
						Stay ahead of the curve
					</h2>
					<p className="mb-6 text-muted-foreground text-sm sm:mb-8 sm:text-base">
						Get a curated roundup of the best new tools delivered to your inbox.
						No spam, unsubscribe anytime.
					</p>

					<NewsletterForm />
					<NewsletterBenefits />
				</div>
			</div>
		</section>
	);
}

// Export sub-components for reuse
export { NewsletterBenefits, NewsletterForm };
