import Image from "next/image";
import { ArrowRightIcon } from "lucide-react";
import { YnsLink } from "../yns-link";

export function Hero() {
	return (
		<section className="relative overflow-hidden bg-secondary/30">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="py-16 sm:py-20 lg:py-28 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] items-center">
					<div className="max-w-2xl">
						<h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-foreground">
							Essentiels soigneusement sélectionnés pour la vie moderne
						</h1>
						<p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed">
							Découvrez notre collection de produits haut de gamme, conçus avec soin et faits pour durer.
						</p>
						<div className="mt-10 flex flex-col sm:flex-row gap-4">
							<YnsLink
								prefetch={"eager"}
								href="#products"
								className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-foreground text-primary-foreground rounded-full text-base font-medium hover:bg-foreground/90 transition-colors"
							>
								Voir la collection
								<ArrowRightIcon className="h-4 w-4" />
							</YnsLink>
							<YnsLink
								prefetch={"eager"}
								href="#about"
								className="inline-flex items-center justify-center gap-2 h-12 px-8 border border-border rounded-full text-base font-medium hover:bg-secondary transition-colors"
							>
								Notre histoire
							</YnsLink>
						</div>
					</div>

					<div className="relative w-full max-w-2xl mx-auto lg:mx-0">
						<div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-secondary shadow-lg">
							<Image
								src="/hero.jpg"
								alt="Featured collection"
								fill
								priority
								sizes="(max-width: 1024px) 90vw, 40vw"
								className="object-cover"
							/>
						</div>
					</div>
				</div>
			</div>
			<div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/3 h-full bg-linear-to-l from-secondary/50 to-transparent pointer-events-none hidden lg:block" />
		</section>
	);
}
