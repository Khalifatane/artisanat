import { ArrowRight } from "lucide-react";
import { commerce, type Collection, type Product } from "@/lib/commerce";
import { CURRENCY, LOCALE } from "@/lib/constants";
import { generateFakeRating } from "@/lib/fake-rating";
import { formatMoney } from "@/lib/money";
import { YNSImage } from "@/lib/yns-image";
import { YnsLink } from "../yns-link";
import { AddToWishlistButton } from "@/app/product/[slug]/add-to-wishlist-button";

type ProductGridProps = {
	title?: string;
	description?: string;
	products?: (Product | Collection["productCollections"][number]["product"])[];
	limit?: number;
	showViewAll?: boolean;
	viewAllHref?: string;
};

export async function ProductGrid({
	title = "Produits en vedette",
	description = "Coups de cœur sélectionnés dans notre collection",
	products,
	limit = 6,
	showViewAll = true,
	viewAllHref = "/products",
}: ProductGridProps) {
	const displayProducts = products ?? (await commerce.productBrowse({ active: true, limit })).data;

	return (
		<section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
			<div className="flex items-end justify-between mb-12">
				<div>
					<h2 className="text-2xl sm:text-3xl font-medium text-foreground">{title}</h2>
					<p className="mt-2 text-muted-foreground">{description}</p>
				</div>
				{showViewAll && (
					<YnsLink
						prefetch={"eager"}
						href={viewAllHref}
						className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						Voir tout
						<ArrowRight className="h-4 w-4" />
					</YnsLink>
				)}
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
				{displayProducts.map((product) => {
					const variants = "variants" in product ? product.variants : null;
					const firstVariantPrice = variants?.[0] ? BigInt(variants[0].price) : null;
					const { minPrice, maxPrice } =
						variants && firstVariantPrice !== null
							? variants.reduce(
									(acc, v) => {
										const price = BigInt(v.price);
										return {
											minPrice: price < acc.minPrice ? price : acc.minPrice,
											maxPrice: price > acc.maxPrice ? price : acc.maxPrice,
										};
									},
									{ minPrice: firstVariantPrice, maxPrice: firstVariantPrice },
								)
							: { minPrice: null, maxPrice: null };

					const priceDisplay =
						variants && variants.length > 1 && minPrice && maxPrice && minPrice !== maxPrice
							? `${formatMoney({ amount: minPrice, currency: CURRENCY, locale: LOCALE })} - ${formatMoney({ amount: maxPrice, currency: CURRENCY, locale: LOCALE })}`
							: minPrice
								? formatMoney({ amount: minPrice, currency: CURRENCY, locale: LOCALE })
								: null;

					const allImages = [
						...(product.images ?? []),
						...(variants
							?.flatMap((v) => v.images ?? [])
							.filter((img) => !(product.images ?? []).includes(img)) ?? []),
					];
					const primaryImage = allImages[0];
					const secondaryImage = allImages[1];
					const { rating, reviewCount } = generateFakeRating(product.id);

					return (
						<YnsLink prefetch={"eager"} key={product.id} href={`/product/${product.slug}`} className="group">
							<div className="relative aspect-square bg-secondary rounded-2xl overflow-hidden mb-4">
								{primaryImage && (
									<YNSImage
										src={primaryImage}
										alt={product.name}
										fill
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
										className="object-cover transition-opacity duration-500 group-hover:opacity-0"
									/>
								)}
								{secondaryImage && (
									<YNSImage
										src={secondaryImage}
										alt={`${product.name} - alternate view`}
										fill
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
										className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
									/>
								)}
								<div className="absolute top-3 right-3 z-20">
									<AddToWishlistButton
										product={{
											id: product.id,
											name: product.name,
											slug: product.slug,
											image: primaryImage ?? null,
											price: variants?.[0]?.price ?? null,
										}}
									/>
								</div>
							</div>
							<div className="space-y-1">
								<h3 className="text-base font-medium text-foreground">{product.name}</h3>
								<p className="text-base font-semibold text-foreground">{priceDisplay}</p>
								<p className="text-xs text-muted-foreground">
									Note {rating} ({reviewCount})
								</p>
							</div>
						</YnsLink>
					);
				})}
			</div>

			{showViewAll && (
				<div className="mt-12 text-center sm:hidden">
					<YnsLink
						prefetch={"eager"}
						href={viewAllHref}
						className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						Voir tous les produits
						<ArrowRight className="h-4 w-4" />
					</YnsLink>
				</div>
			)}
		</section>
	);
}
