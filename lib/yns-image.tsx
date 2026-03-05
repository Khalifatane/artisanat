import { type ComponentProps } from "react";

type ImageProps = ComponentProps<"img"> & {
	fill?: boolean;
	// Accept Next/Image-only prop so it doesn't leak to <img>.
	priority?: boolean;
};

export function YNSImage({ fill, style, priority: _priority, ...props }: ImageProps) {
	const mergedStyle: React.CSSProperties = fill
		? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style }
		: style;

	return <img {...props} style={mergedStyle} />;
}
