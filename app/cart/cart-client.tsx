"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/cart/actions";
import { useCart } from "@/app/cart/cart-context";
import { Button } from "@/components/ui/button";
import { CURRENCY, LOCALE } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { YnsLink } from "@/components/yns-link";

export function CartClient() {
	const { items, subtotal } = useCart();
	const router = useRouter();
	const [, startTransition] = useTransition();

	if (items.length === 0) {
		return (
			<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<h1 className="text-2xl font-semibold">Votre panier est vide</h1>
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
			<h1 className="text-2xl font-semibold">Votre panier</h1>
			<div className="border border-border rounded-lg divide-y divide-border">
				{items.map((item) => {
					const canIncrement =
						item.productVariant.stock > 0 && item.quantity < item.productVariant.stock;

					return (
						<div key={item.productVariant.id} className="p-4 flex items-start justify-between gap-4">
							<div className="flex-1 min-w-0 space-y-1">
								<p className="font-medium">{item.productVariant.product.name}</p>
								<p className="text-sm text-muted-foreground">
									Size: {item.productVariant.size} • Color: {item.productVariant.color}
								</p>
								<p className="text-sm text-muted-foreground">
									Stock: {item.productVariant.stock > 0 ? item.productVariant.stock : "Out of stock"}
									{item.productVariant.incomingStock && item.productVariant.incomingStock > 0
										? ` • Incoming: ${item.productVariant.incomingStock}`
										: ""}
								</p>
								{item.productVariant.stock === 0 &&
									item.productVariant.incomingStock &&
									item.productVariant.incomingStock > 0 && (
										<p className="text-sm text-orange-500">
											Restock on{" "}
											{item.productVariant.restockDate
												? new Date(item.productVariant.restockDate).toLocaleDateString()
												: "soon"}
										</p>
									)}
								<p className="text-sm text-muted-foreground">Qty {item.quantity}</p>
								<button
									type="button"
									disabled={!canIncrement}
									onClick={() => {
										if (!canIncrement) return;
										startTransition(async () => {
											await addToCart({
												productId: item.productVariant.product.id,
												size: item.productVariant.size,
												color: item.productVariant.color,
												quantity: 1,
											});
											router.refresh();
										});
									}}
									className="mt-2 inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Add to Cart
								</button>
							</div>
							<p className="shrink-0 font-semibold">
								{formatMoney({
									amount: BigInt(item.productVariant.price) * BigInt(item.quantity),
									currency: CURRENCY,
									locale: LOCALE,
								})}
							</p>
						</div>
					);
				})}
			</div>
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">Subtotal</p>
				<p className="text-lg font-semibold">
					{formatMoney({ amount: subtotal, currency: CURRENCY, locale: LOCALE })}
				</p>
			</div>
			<Button asChild>
				<YnsLink prefetch={false} href="/checkout">
					Checkout
				</YnsLink>
			</Button>
		</div>
	);
}

