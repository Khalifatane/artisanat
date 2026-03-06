import { cacheLife } from "next/cache";
import { YnsLink } from "@/components/yns-link";
import { commerce } from "@/lib/commerce";

async function FooterCollections() {
	"use cache";
	cacheLife("hours");

	const collections = await commerce.collectionBrowse({ limit: 5 });

	if (collections.data.length === 0) {
		return null;
	}

	return (
		<div>
			<h3 className="text-sm font-semibold text-foreground">Collections</h3>
			<ul className="mt-4 space-y-3">
				{collections.data.map((collection) => (
					<li key={collection.id}>
						<YnsLink
							prefetch={"eager"}
							href={`/collection/${collection.slug}`}
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							{collection.name}
						</YnsLink>
					</li>
				))}
			</ul>
		</div>
	);
}

async function FooterLegalPages() {
	"use cache";
	cacheLife("hours");

	const pages = await commerce.legalPageBrowse();

	if (pages.data.length === 0) {
		return null;
	}

	return (
		<div>
			<h3 className="text-sm font-semibold text-foreground">Legal</h3>
			<ul className="mt-4 space-y-3">
				{pages.data.map((page) => (
					<li key={page.id}>
						<YnsLink
							prefetch={"eager"}
							href={`/legal${page.path}`}
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							{page.title}
						</YnsLink>
					</li>
				))}
			</ul>
		</div>
	);
}

export function Footer() {
	const informationLinks = [
		{ label: "Présentation de l’entreprise", href: "/legal/presentation-de-l-entreprise" },
		{ label: "Politique de confidentialité", href: "/legal/politique-de-confidentialite" },
		{ label: "Modes de paiement", href: "/legal/modes-de-paiement" },
		{ label: "Livraison et retours", href: "/legal/livraison-et-retours" },
	];

	return (
		<footer className="border-t border-border bg-background">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="py-12 sm:py-16 flex flex-col sm:flex-row gap-8 sm:gap-16">
					{/* Brand */}
					<div className="sm:max-w-xs">
						<YnsLink prefetch={"eager"} href="/" className="text-xl font-bold text-foreground">
							Votre prochaine boutique
						</YnsLink>
						<p className="mt-4 text-sm text-muted-foreground leading-relaxed">
							Essentiels soigneusement sélectionnés pour la vie moderne. Des produits de qualité, conçus avec soin.
						</p>
					</div>

					{/* Collections */}
					<FooterCollections />

					{/* Legal */}
					<FooterLegalPages />

					{/* Informations */}
					<div>
						<h3 className="text-sm font-semibold text-foreground">Informations</h3>
						<ul className="mt-4 space-y-3">
							{informationLinks.map((link) => (
								<li key={link.href}>
									<YnsLink
										prefetch={"eager"}
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.label}
									</YnsLink>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Bottom bar */}
				<div className="py-6 border-t border-border">
					<p className="text-sm text-muted-foreground">
						&copy; {new Date().getFullYear()} Votre prochaine boutique. Tous droits réservés.
					</p>
				</div>
			</div>
		</footer>
	);
}
