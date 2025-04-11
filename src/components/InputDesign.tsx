"use client";

import * as React from "react";

export interface InputDesignProps {
  /**
   * The source URL for the image
   * @default "https://cdn.builder.io/api/v1/image/assets/927b9a80949c4d889ff9444d061133f5/88caa8eb1f3efa7cebbd82132ea8b0989a506d9d?placeholderIfAbsent=true"
   */
  imageUrl?: string;
  /**
   * Alternative text for the image
   */
  alt?: string;
}

export default function InputDesign({
  imageUrl = "https://cdn.builder.io/api/v1/image/assets/927b9a80949c4d889ff9444d061133f5/88caa8eb1f3efa7cebbd82132ea8b0989a506d9d?placeholderIfAbsent=true",
  alt = "Input Design",
}: InputDesignProps) {
  return (
    <img
      src={imageUrl}
      alt={alt}
      className="object-contain max-w-full aspect-[1.05] w-[125px]"
    />
  );
}
