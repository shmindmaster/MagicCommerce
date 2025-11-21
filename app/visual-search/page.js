"use client";

import { useState } from "react";

export default function VisualSearchPage() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const handleSearch = async () => {
    if (!image) return;
    setLoading(true);
    const form = new FormData();
    form.append("image", image);
    try {
      const res = await fetch("/api/products/visual-search", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Failed to analyze image" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Visual Search</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
      <button
        onClick={handleSearch}
        disabled={!image || loading}
        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
      >
        {loading ? "Analyzing..." : "Search"}
      </button>
      {result && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
