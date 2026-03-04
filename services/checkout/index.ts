"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CheckoutCustomer } from "@/types/checkout";

export const useCheckout = create<{
	step: "cart" | "customer" | "shipping" | "payment";
	customer: CheckoutCustomer | null;
	shipping: Record<string, string> | null;
	setCustomer: (data: CheckoutCustomer) => void;
	setShipping: (data: Record<string, string>) => void;
	nextStep: () => void;
	prevStep: () => void;
	reset: () => void;
}>()(
	persist(
		(set, get) => ({
			step: "cart",
			customer: null,
			shipping: null,
			setCustomer: (customer) => set({ customer, step: "shipping" }),
			setShipping: (shipping) => set({ shipping, step: "payment" }),
			nextStep: () => {
				const steps = ["cart", "customer", "shipping", "payment"] as const;
				const currentIndex = steps.indexOf(get().step);
				if (currentIndex < steps.length - 1) {
					set({ step: steps[currentIndex + 1] });
				}
			},
			prevStep: () => {
				const steps = ["cart", "customer", "shipping", "payment"] as const;
				const currentIndex = steps.indexOf(get().step);
				if (currentIndex > 0) {
					set({ step: steps[currentIndex - 1] });
				}
			},
			reset: () => set({ step: "cart", customer: null, shipping: null }),
		}),
		{ name: "checkout-storage" },
	),
);
