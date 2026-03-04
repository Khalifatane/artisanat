"use client";

import { useMemo, useState } from "react";
import { checkout } from "@/app/cart/actions";
import { useCart } from "@/app/cart/cart-context";
import { Button } from "@/components/ui/button";
import { CURRENCY, LOCALE } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { useCheckout } from "@/services/checkout";

export function CheckoutClient() {
	const { items, subtotal } = useCart();
	const { step, customer, shipping, setCustomer, setShipping, nextStep, prevStep } = useCheckout();
	const [email, setEmail] = useState(customer?.email ?? "");
	const [paymentMethod, setPaymentMethod] = useState<"cod" | "paystack">("cod");
	const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "local">("pickup");

	const formattedSubtotal = useMemo(
		() => formatMoney({ amount: subtotal, currency: CURRENCY, locale: LOCALE }),
		[subtotal],
	);

	const ownerWhatsApp = process.env.NEXT_PUBLIC_OWNER_WHATSAPP_NUMBER;

	const handleCustomerSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (!email.trim()) return;
		setCustomer({ email: email.trim() });
	};

	const handleShippingSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		const formData = new FormData(form);
		const data = Array.from(formData.entries()).reduce<Record<string, string>>((acc, [key, value]) => {
			if (typeof value === "string") acc[key] = value;
			return acc;
		}, {});
		setShipping(data);
	};

	const hasItems = items.length > 0;

	const buildWhatsAppUrl = (message: string) => {
		if (!ownerWhatsApp) return null;
		const encoded = encodeURIComponent(message);
		return `https://wa.me/${ownerWhatsApp.replace("whatsapp:", "")}?text=${encoded}`;
	};

	const buildOrderMessage = (options: { paid: boolean; reference?: string }) => {
		const lines = [
			`New order (${options.paid ? "Paid" : "Pay on delivery"})`,
			`Email: ${customer?.email ?? "N/A"}`,
			"",
			"Items:",
			...items.map((item) => `- ${item.quantity}x ${item.productVariant.product.name}`),
			"",
			`Subtotal: ${formattedSubtotal}`,
		];

		if (shipping) {
			lines.push("", "Shipping:");
			Object.entries(shipping).forEach(([key, value]) => {
				lines.push(`${key}: ${value}`);
			});
		}
		lines.push("", `Livraison: ${deliveryMethod === "pickup" ? "Retrait en boutique" : "Livraison locale"}`);

		if (options.reference) {
			lines.push("", `Payment reference: ${options.reference}`);
		}

		return lines.join("\n");
	};

	const handleWhatsAppRedirect = (options: { paid: boolean; reference?: string }) => {
		const url = buildWhatsAppUrl(buildOrderMessage(options));
		if (url) {
			window.open(url, "_blank", "noopener,noreferrer");
		} else {
			alert("WhatsApp number is missing.");
		}
	};

	return (
		<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
			<div>
				<h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
				<p className="text-sm text-muted-foreground mt-2">
					Step {["cart", "customer", "shipping", "payment"].indexOf(step) + 1} of 4
				</p>
			</div>

			{step === "cart" && (
				<section className="space-y-6">
					{!hasItems && (
						<p className="text-sm text-muted-foreground">Votre panier est vide.</p>
					)}
					<div className="border border-border rounded-lg divide-y divide-border">
						{items.map((item) => (
							<div key={item.productVariant.id} className="p-4 flex items-center justify-between">
								<div>
									<p className="font-medium">{item.productVariant.product.name}</p>
									<p className="text-sm text-muted-foreground">Qty {item.quantity}</p>
								</div>
								<p className="font-semibold">
									{formatMoney({
										amount: BigInt(item.productVariant.price) * BigInt(item.quantity),
										currency: CURRENCY,
										locale: LOCALE,
									})}
								</p>
							</div>
						))}
					</div>
					<div className="flex items-center justify-between">
						<p className="text-sm text-muted-foreground">Subtotal</p>
						<p className="text-lg font-semibold">{formattedSubtotal}</p>
					</div>
					<Button type="button" onClick={nextStep} disabled={!hasItems}>
						Continue
					</Button>
				</section>
			)}

			{step === "customer" && (
				<section className="space-y-6">
					<form className="space-y-4" onSubmit={handleCustomerSubmit}>
						<div>
							<label className="block text-sm font-medium">Email</label>
							<input
								type="email"
								required
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
							/>
						</div>
						<div className="flex items-center gap-3">
							<Button type="button" variant="outline" onClick={prevStep}>
								Back
							</Button>
							<Button type="submit">Continue</Button>
						</div>
					</form>
				</section>
			)}

			{step === "shipping" && (
				<section className="space-y-6">
					<form className="space-y-4" onSubmit={handleShippingSubmit}>
						<div className="space-y-3">
							<p className="text-sm font-medium">Mode de livraison</p>
							<label className="flex items-start gap-2 text-sm">
								<input
									type="radio"
									name="deliveryMethod"
									value="pickup"
									checked={deliveryMethod === "pickup"}
									onChange={() => setDeliveryMethod("pickup")}
								/>
								<span>
									<span className="font-medium">Retrait en boutique</span>
									<br />
									<span className="text-muted-foreground">
										Récupérez votre commande directement dans notre boutique.
									</span>
								</span>
							</label>
							<label className="flex items-start gap-2 text-sm">
								<input
									type="radio"
									name="deliveryMethod"
									value="local"
									checked={deliveryMethod === "local"}
									onChange={() => setDeliveryMethod("local")}
								/>
								<span>
									<span className="font-medium">Livraison locale</span>
									<br />
									<span className="text-muted-foreground">
										Pour une livraison à domicile, veuillez partager votre adresse via Google Maps. Notre
										équipe vous contactera rapidement pour organiser la livraison. Les tarifs varient selon
										les quartiers de Saint-Louis (Île, Sor, Pikine, Gandon, etc.), sauf si vous choisissez un
										point relais.
									</span>
								</span>
							</label>
						</div>
						<div>
							<label className="block text-sm font-medium">Full Name</label>
							<input
								name="name"
								required
								className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium">Address</label>
							<input
								name="address"
								required
								className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
							/>
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label className="block text-sm font-medium">City</label>
								<input
									name="city"
									required
									className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium">Point relais (optionnel)</label>
								<input
									name="relayPoint"
									className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
								/>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<Button type="button" variant="outline" onClick={prevStep}>
								Back
							</Button>
							<Button type="submit">Continue</Button>
						</div>
					</form>
				</section>
			)}

			{step === "payment" && (
				<section className="space-y-6">
					<div className="border border-border rounded-lg p-4">
						<p className="text-sm text-muted-foreground">Subtotal</p>
						<p className="text-2xl font-semibold">{formattedSubtotal}</p>
					</div>

					<div className="space-y-4">
						<div className="space-y-2">
							<p className="text-sm font-medium">Payment Method</p>
							<label className="flex items-center gap-2 text-sm">
								<input
									type="radio"
									name="paymentMethod"
									value="cod"
									checked={paymentMethod === "cod"}
									onChange={() => setPaymentMethod("cod")}
								/>
								Payer apres livraison
							</label>
							<label className="flex items-center gap-2 text-sm">
								<input
									type="radio"
									name="paymentMethod"
									value="paystack"
									checked={paymentMethod === "paystack"}
									onChange={() => setPaymentMethod("paystack")}
								/>
								Paystack
							</label>
						</div>

						<div className="flex items-center gap-3">
							<Button type="button" variant="outline" onClick={prevStep}>
								Back
							</Button>
							{paymentMethod === "cod" ? (
								<Button
									type="button"
									disabled={!customer?.email || !shipping || !hasItems}
									onClick={() => handleWhatsAppRedirect({ paid: false })}
								>
									Checkout WhatsApp
								</Button>
							) : (
								<form action={checkout}>
									<input type="hidden" name="email" value={customer?.email ?? ""} />
									<Button type="submit" disabled={!customer?.email || !shipping || !hasItems}>
										Payer avec Paystack
									</Button>
								</form>
							)}
						</div>
					</div>
				</section>
			)}
		</div>
	);
}
