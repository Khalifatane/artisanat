import { type ComponentProps } from "react";

type ImageProps = ComponentProps<"img"> & {
	fill?: boolean;
};

export function YNSImage({ fill, style, ...props }: ImageProps) {
	const mergedStyle: React.CSSProperties = fill
		? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style }
		: style;

	return <img {...props} style={mergedStyle} />;
}
