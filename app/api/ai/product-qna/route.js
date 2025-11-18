// app/api/ai/product-qna/route.js
import prisma from '@/app/libs/Prisma';
import { NextResponse } from 'next/server';
import { chatCompletion } from '@/app/libs/azureOpenAI';

export async function POST(req) {
  try {
    const { productId, question } = await req.json();

    if (!productId || !question) {
      await prisma.$disconnect();
      return new NextResponse('Missing productId or question', { status: 400 });
    }

    const product = await prisma.products.findUnique({
      where: { id: Number(productId) },
      select: { title: true, description: true, price: true },
    });

    if (!product) {
      await prisma.$disconnect();
      return new NextResponse('Product not found', { status: 404 });
    }

    const answer = await chatCompletion({
      messages: [
        {
          role: 'system',
          content: `
You are a product specialist for MagicCommerce. 
Answer questions ONLY using the provided product data.
If the info is not present, say you don't know rather than guessing.
Product: ${JSON.stringify(product)}
        `.trim(),
        },
        { role: 'user', content: question },
      ],
      temperature: 0.4,
      maxTokens: 400,
    });

    await prisma.$disconnect();
    return NextResponse.json({ answer });
  } catch (err) {
    console.error('[Product QnA] Error', err);
    await prisma.$disconnect();
    return new NextResponse('Something went wrong', { status: 400 });
  }
}
