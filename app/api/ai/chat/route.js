// app/api/ai/chat/route.js
import { NextResponse } from 'next/server';
import { chatCompletion } from '@/app/libs/azureOpenAI';
import prisma from '@/app/libs/Prisma';
import { getCurrentUser } from '@/app/libs/auth';

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages, cartProductIds = [] } = body;

    let cartContext = '';
    if (cartProductIds.length > 0) {
      const products = await prisma.products.findMany({
        where: { id: { in: cartProductIds.map(Number) } },
        select: { id: true, title: true, description: true, price: true },
      });
      cartContext = JSON.stringify(products);
    }

    const user = await getCurrentUser().catch(() => null);

    const systemMessage = {
      role: 'system',
      content: `
You are MagicCommerce AI Shopping Assistant.
- Help users discover products from the catalog and compare them.
- Use ONLY product info passed in context; don't hallucinate availability.
- Be concise and sales-friendly.
      `.trim(),
    };

    const contextMessage = {
      role: 'system',
      content: `Current user: ${user?.email ?? 'guest'}
Cart / context products: ${cartContext || 'none'}`,
    };

    const answer = await chatCompletion({
      messages: [systemMessage, contextMessage, ...(messages || [])],
      temperature: 0.5,
      maxTokens: 600,
    });

    await prisma.$disconnect();
    return NextResponse.json({ answer });
  } catch (err) {
    console.error('[AI Chat] Error', err);
    await prisma.$disconnect();
    return new NextResponse('AI chat error', { status: 500 });
  }
}
