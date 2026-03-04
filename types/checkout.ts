export type CheckoutCustomer = {
	email: string;
	firstName?: string;
	lastName?: string;
};

export type CheckoutPayload = {
	customer: CheckoutCustomer;
	shipping: Record<string, string>;
};
