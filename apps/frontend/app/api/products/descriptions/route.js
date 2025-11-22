import { NextResponse } from 'next/server';
import { chatCompletion } from '@/app/libs/azureOpenAI';
import prisma from '@/app/libs/Prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return new NextResponse('Product ID is required', { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
      select: {
        title: true,
        description: true,
        features: true,
      },
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    const prompt = `Generate a detailed product description for the following product:
Title: ${product.title}
Description: ${product.description}
Features: ${product.features}

Provide a compelling and detailed description that highlights the product's key features and benefits.`;

    const aiResponse = await chatCompletion({
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 512,
      temperature: 0.7,
    });

    return NextResponse.json({ description: aiResponse });
  } catch (error) {
    console.error('[Product Description API]', error);
    return new NextResponse('Failed to generate product description', { status: 500 });
  }
}