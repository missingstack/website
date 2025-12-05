import { Mail, Twitter } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface ContactSectionProps {
	title?: string;
	description?: ReactNode;
	twitterHandle?: string;
	twitterUrl?: string;
	emailHref?: string;
	className?: string;
}

export function ContactSection({
	title = "Get in Touch",
	description,
	twitterHandle = "@iamya6av",
	twitterUrl = "https://twitter.com/iamya6av",
	emailHref = "mailto:pravven.yadav@missing.studio",
	className,
}: ContactSectionProps) {
	const defaultDescription = (
		<>
			Contact yadav at{" "}
			<a
				href={twitterUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="font-medium underline transition-colors hover:text-white"
			>
				{twitterHandle}
			</a>{" "}
			to discuss how we can help you reach our engaged developer community Or{" "}
			<a
				href={emailHref}
				className="font-medium underline transition-colors hover:text-white"
			>
				Email
			</a>{" "}
			us
		</>
	);

	return (
		<section
			className={cn(
				"rounded-2xl bg-primary p-8 text-center text-white sm:p-10 lg:p-12",
				className,
			)}
		>
			<div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 transition-transform duration-200 hover:scale-110 sm:mb-8 sm:h-16 sm:w-16">
				<Mail className="h-7 w-7 sm:h-8 sm:w-8" />
			</div>
			<h2 className="mb-4 text-2xl leading-tight sm:mb-6 sm:text-3xl md:text-4xl">
				{title}
			</h2>
			<p className="mx-auto mb-8 max-w-xl text-sm text-white/80 sm:mb-10 sm:text-base">
				{description || defaultDescription}
			</p>
			<Button
				size="lg"
				className="gap-2 rounded-full bg-white px-8 text-primary transition-all duration-300 hover:scale-105 hover:bg-white/90 active:scale-95 sm:px-10"
				asChild
			>
				<a href={twitterUrl} target="_blank" rel="noopener noreferrer">
					<Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
					Contact on X
				</a>
			</Button>
		</section>
	);
}
