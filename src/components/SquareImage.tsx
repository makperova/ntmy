"use client";

import * as React from "react";

interface SquareImageProps {
  /**
   * Alternative text for the image for accessibility
   * @default "Design Input"
   */
  alt?: string;
}

export default function SquareImage({
  alt = "Design Input",
}: SquareImageProps) {
  return (
    <figure className="inline-block">
      <img
        src="https://cdn.builder.io/api/v1/image/assets/927b9a80949c4d889ff9444d061133f5/61b6be031e582437736915eed0f17990318de016?placeholderIfAbsent=true"
        alt={alt}
        className="object-contain max-w-full aspect-square w-[120px]"
      />
    </figure>
  );
} 