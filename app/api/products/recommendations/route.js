// app/api/products/recommendations/route.js
import prisma from '@/app/libs/Prisma';
import { NextResponse } from 'next/server';
import { chatCompletion } from '@/app/libs/azureOpenAI';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    // Get the current product if productId is provided
    let currentProduct = null;
    if (productId) {
      currentProduct = await prisma.products.findUnique({
        where: { id: Number(productId) },
        select: { id: true, title: true, description: true, price: true },
      });
    }

    // Fetch 15 random products (excluding current product if specified)
    const productsCount = await prisma.products.count();
    const skip = Math.floor(Math.random() * Math.max(0, productsCount - 15));
    const candidates = await prisma.products.findMany({
      take: 15,
      skip: skip,
      where: productId ? { id: { not: Number(productId) } } : undefined,
      select: { id: true, title: true, description: true, price: true },
    });

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
              role: 'system',
              content:
                'You are an e-commerce recommendation engine. Respond only with JSON arrays of product IDs.',
            },
            { role: 'user', content: aiInstruction },
          ],
          temperature: 0.3,
          maxTokens: 256,
        });

        // Parse AI response to get recommended product IDs
        const recommendedIds = JSON.parse(aiAnswer);
        
        // Filter candidates to only include recommended products
        const recommendations = candidates.filter((p) => recommendedIds.includes(p.id)).slice(0, 5);
        
        // If AI gave us less than 5, fill with random from candidates
        if (recommendations.length < 5) {
          const remainingCandidates = candidates.filter(
            (p) => !recommendedIds.includes(p.id)
          );
          recommendations.push(...remainingCandidates.slice(0, 5 - recommendations.length));
        }

        await prisma.$disconnect();
        return NextResponse.json(recommendations);
      } catch (aiError) {
        console.warn('[Recommendations] AI failed, falling back to random', aiError);
        // Fall back to random selection
        await prisma.$disconnect();
        return NextResponse.json(candidates.slice(0, 5));
      }
    }

    // No current product or AI not available, return random
    await prisma.$disconnect();
    return NextResponse.json(candidates.slice(0, 5));
  } catch (error) {
    console.error('[Recommendations] Error', error);
    await prisma.$disconnect();
    return new NextResponse('Something went wrong', { status: 400 });
  }
}
