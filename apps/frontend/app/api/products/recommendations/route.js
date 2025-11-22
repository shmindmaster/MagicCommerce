// app/api/products/recommendations/route.js
import prisma from "@/app/libs/Prisma";
import { NextResponse } from "next/server";
import { chatCompletion } from "@/app/libs/azureOpenAI";
import { vectorSearch, generateSearchEmbedding } from "@/app/libs/azureSearch";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const useVectorSearch = searchParams.get("vector") === "true";

    // Get the current product if productId is provided
    let currentProduct = null;
    if (productId) {
      currentProduct = await prisma.product.findUnique({
        where: { id: Number(productId) },
        select: {
          id: true,
          title: true,
          description: true,
          priceCents: true,
        },
      });

      if (currentProduct) {
        currentProduct = {
          ...currentProduct,
          price: currentProduct.priceCents,
        };
      }
    }

    // Try vector-based recommendations if enabled and we have a current product
    if (useVectorSearch && currentProduct) {
      try {
        // Generate embedding for current product
        const embeddingText = `${currentProduct.title} ${currentProduct.description} Price: $${(currentProduct.priceCents / 100).toFixed(2)}`;
        const embedding = await generateSearchEmbedding(embeddingText);
        
        // Find similar products using vector search
        const vectorResults = await vectorSearch(embedding, 10);
        
        // Filter out the current product and take top 5
        const recommendations = vectorResults
          .filter(p => p.id !== currentProduct.id)
          .slice(0, 5)
          .map(p => ({
            ...p,
            price: p.priceCents,
          }));

        if (recommendations.length > 0) {
          return NextResponse.json(recommendations);
        }
      } catch (vectorError) {
        console.warn("[Recommendations] Vector search failed, falling back to AI selection:", vectorError);
        // Continue with AI-based recommendations as fallback
      }
    }

    // Fallback: AI-based recommendations
    // Fetch 15 random products (excluding current product if specified)
    const productsCount = await prisma.product.count();
    const skip = Math.floor(Math.random() * Math.max(0, productsCount - 15));
    const candidatesRaw = await prisma.product.findMany({
      take: 15,
      skip: skip,
      where: productId ? { id: { not: Number(productId) } } : undefined,
      select: {
        id: true,
        title: true,
        description: true,
        priceCents: true,
      },
    });

    const candidates = candidatesRaw.map((p) => ({
      ...p,
      price: p.priceCents,
    }));

    // If we have a current product, use AI to select the best recommendations
    if (currentProduct && candidates.length > 0) {
      const aiInstruction = `
Given the current product and a list of candidate products, select the top 5 products that would be the best upsell/cross-sell recommendations.
Consider product similarity, complementary items, and natural shopping patterns.
Return ONLY a JSON array of product IDs (numbers) for the top 5 recommendations.

Current Product: ${JSON.stringify(currentProduct)}
Candidates: ${JSON.stringify(candidates)}
`.trim();

      try {
        const aiAnswer = await chatCompletion({
          messages: [
            {
              role: "system",
              content:
                "You are an e-commerce recommendation engine. Respond only with JSON arrays of product IDs.",
            },
            { role: "user", content: aiInstruction },
          ],
          temperature: 0.3,
          maxTokens: 256,
        });

        // Parse AI response to get recommended product IDs
        const recommendedIds = JSON.parse(aiAnswer.trim());
        
        // Filter candidates to only include recommended products
        const recommendations = candidates
          .filter((p) => recommendedIds.includes(p.id))
          .slice(0, 5);
        
        // If AI gave us less than 5, fill with random from candidates
        if (recommendations.length < 5) {
          const remainingCandidates = candidates.filter(
            (p) => !recommendedIds.includes(p.id)
          );
          recommendations.push(
            ...remainingCandidates.slice(0, 5 - recommendations.length)
          );
        }

        return NextResponse.json(recommendations);
      } catch (aiError) {
        console.warn("[Recommendations] AI failed, falling back to random", aiError);
        // Fall back to random selection
        return NextResponse.json(candidates.slice(0, 5));
      }
    }

    // No current product or AI not available, return random
    return NextResponse.json(candidates.slice(0, 5));
  } catch (error) {
    console.error("[Recommendations] Error", error);
    return new NextResponse("Something went wrong", { status: 400 });
  }
}
