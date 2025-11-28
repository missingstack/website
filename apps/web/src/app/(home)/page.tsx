import { Header } from "~/components/home/header";
import { HeroSection } from "~/components/home/hero-section";

export default function Home() {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Header />
			<HeroSection />
		</div>
	);
}
