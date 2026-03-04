import { defineField, defineType } from "sanity";

export const product = defineType({
	name: "product",
	title: "Product",
	type: "document",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "slug",
			title: "Slug",
			type: "slug",
			options: { source: "title", maxLength: 96 },
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "description",
			title: "Description",
			type: "text",
		}),
		defineField({
			name: "price",
			title: "Price (kobo)",
			type: "number",
			validation: (rule) => rule.required().min(0),
		}),
		defineField({
			name: "images",
			title: "Images",
			type: "array",
			of: [{ type: "image" }],
		}),
		defineField({
			name: "variants",
			title: "Variants (Size / Color / Stock)",
			type: "array",
			of: [
				{
					type: "object",
					fields: [
						{ name: "size", type: "string", title: "Size" },
						{ name: "color", type: "string", title: "Color" },
						{ name: "stock", type: "number", title: "Stock" },
						{ name: "incomingStock", type: "number", title: "Incoming Stock" },
						{ name: "restockDate", type: "date", title: "Restock Date" },
					],
				},
			],
		}),
		defineField({
			name: "categories",
			title: "Categories",
			type: "array",
			of: [{ type: "reference", to: [{ type: "collection" }] }],
		}),
	],
});
