"use client";

import { useState } from "react";
import { BiCamera } from "react-icons/bi";
import type { Product } from "@/app/libs/types";
import { features } from "@/app/libs/config";

interface VisualSearchProps {
  onSearch: (products: Product[]) => void;
}

export default function VisualSearch({ onSearch }: VisualSearchProps) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/products/visual-search", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Visual search failed");

      const products = (await res.json()) as Product[];
      onSearch(products);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Only render if visual search is enabled
  if (!features.visualSearch) {
    return null;
  }

  return (
    <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full" title="Search by image">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      <BiCamera
        size={24}
        className={uploading ? "animate-pulse text-orange-600" : "text-gray-600"}
      />
    </label>
  );
}
