import { defineField, defineType } from "sanity";

export const collection = defineType({
	name: "collection",
	title: "Collection",
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
			name: "products",
			title: "Products",
			type: "array",
			of: [{ type: "reference", to: [{ type: "product" }] }],
		}),
		defineField({
			name: "description",
			title: "Description",
			type: "text",
		}),
		defineField({
			name: "image",
			title: "Image",
			type: "image",
		}),
	],
});
