// app/api/products/visual-search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/app/libs/azureOpenAI";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return new NextResponse("Missing file", { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64Image}`;

    const description = await chatCompletion({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe the main shoppable product in this image for an e-commerce search query. Focus on color, type, material, and style. Keep it under 15 words.",
            },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        } as any,
      ],
      maxTokens: 64,
    });

const url = new URL(req.url);
    url.pathname = "/api/products/ai-search";
    url.searchParams.set("q", description);
    url.searchParams.set("vector", "true"); // Use vector search for better visual matching

    const searchRes = await fetch(url.toString(), { method: "GET" });
    if (!searchRes.ok) {
      throw new Error("Downstream AI search failed");
    }

    const products = await searchRes.json();
    return NextResponse.json(products);
  } catch (error) {
    console.error("[visual-search]", error);
    return new NextResponse("Error processing image", { status: 500 });
  }
}
