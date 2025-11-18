// app/api/products/ai-search/route.js
import prisma from '@/app/libs/Prisma';
import { NextResponse } from 'next/server';
import { chatCompletion } from '@/app/libs/azureOpenAI';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    if (!q.trim()) return NextResponse.json([]);

    // Step 1: Ask AI to expand the query into keywords/synonyms
    const aiInstruction = `
Given a customer search query, return a JSON array of 3–7 keywords and phrases that
should be used to search product title and description. Focus on product semantics.
ONLY return the JSON array, nothing else. Query: "${q}"
`.trim();

    const aiAnswer = await chatCompletion({
      messages: [
        { role: 'system', content: 'You expand e-commerce queries into better keyword sets.' },
        { role: 'user', content: aiInstruction },
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

    // Step 2: Build a simple OR filter over title/description
    const whereClause = {
      OR: keywords.map((kw) => ({
        OR: [
          { title: { contains: kw, mode: 'insensitive' } },
          { description: { contains: kw, mode: 'insensitive' } },
        ],
      })),
    };

    const products = await prisma.products.findMany({
      where: whereClause,
      take: 20,
    });

    await prisma.$disconnect();
    return NextResponse.json(products);
  } catch (err) {
    console.error('[AI Search] Error', err);
    await prisma.$disconnect();
    return new NextResponse('Something went wrong', { status: 400 });
  }
}
