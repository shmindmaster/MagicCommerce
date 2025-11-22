// app/api/products/ai-search/route.js
import prisma from "@/app/libs/Prisma";
import { NextResponse } from "next/server";
import { chatCompletion } from "@/app/libs/azureOpenAI";
import { semanticSearch } from "@/app/libs/azureSearch";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const useVectorSearch = searchParams.get("vector") === "true";

    if (!q.trim()) return NextResponse.json([]);

    // Try semantic search first if enabled
    if (useVectorSearch) {
      try {
        const semanticResults = await semanticSearch(q, 20);
        if (semanticResults.length > 0) {
          // Convert to expected format
          const result = semanticResults.map((p) => ({
            ...p,
            price: p.priceCents,
          }));
          return NextResponse.json(result);
        }
      } catch (vectorError) {
        console.warn("[AI Search] Vector search failed, falling back to keyword search:", vectorError);
        // Continue with keyword search as fallback
      }
    }

    // Fallback: Enhanced keyword search with AI expansion
    const aiInstruction = `
Given a customer search query, return a JSON array of 3–7 keywords and phrases that
should be used to search product title and description. Focus on product semantics.
ONLY return the JSON array, nothing else. Query: "${q}"
`.trim();

    const aiAnswer = await chatCompletion({
      messages: [
        {
          role: "system",
          content: "You expand e-commerce queries into better keyword sets.",
        },
        { role: "user", content: aiInstruction },
      ],
      temperature: 0.1,
      maxTokens: 256,
    });

    let keywords = [];
    try {
      keywords = JSON.parse(aiAnswer);
    } catch {
      keywords = [q];
    }

    // Build enhanced search with multiple strategies
    const whereClause = {
      OR: [
        // Exact title matches (highest priority)
        ...keywords.map((kw) => ({ title: { contains: kw, mode: "insensitive" } })),
        // Description matches
        ...keywords.map((kw) => ({ description: { contains: kw, mode: "insensitive" } })),
      ],
    };

    const products = await prisma.product.findMany({
      where: whereClause,
      take: 20,
      orderBy: [
        // Prioritize exact title matches
        { title: "asc" },
      ],
    });

    const result = products.map((p) => ({
      ...p,
      price: p.priceCents,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[AI Search] Error", err);
    return new NextResponse("Something went wrong", { status: 400 });
  }
}
