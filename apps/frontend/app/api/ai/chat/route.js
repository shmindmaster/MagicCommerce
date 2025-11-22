// app/api/ai/chat/route.js
import { NextResponse } from "next/server";
import prisma from "@/app/libs/Prisma";
import { chatCompletion } from "@/app/libs/azureOpenAI";
import { analyzeCartForRecommendations, getPersonalizedRecommendations, trackUserBehavior } from "@/app/libs/personalization";

// Enhanced AI chat with product recommendations and cart analysis
// Accepts { message: string, sessionId?: string, cartProductIds?: number[], userId?: string }
// Returns { sessionId, reply, recommendations?: [], insights?: [] }

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      message, 
      sessionId: incomingSessionId, 
      cartProductIds = [], 
      userId 
    } = body;

    if (!message || typeof message !== "string") {
      return new NextResponse("Message is required", { status: 400 });
    }

    // Track user interaction for personalization
    if (userId) {
      await trackUserBehavior({
        userId,
        productId: 0, // Chat interaction doesn't reference specific product
        eventType: 'chat_question',
        metadata: { message, cartProductIds },
      });
    }

    // Enhanced cart context with analysis
    let cartContext = "";
    let cartRecommendations = [];
    let cartInsights = [];

    if (Array.isArray(cartProductIds) && cartProductIds.length > 0) {
      const products = await prisma.product.findMany({
        where: { id: { in: cartProductIds.map(Number) } },
        select: {
          id: true,
          title: true,
          description: true,
          priceCents: true,
        },
      });
      
      cartContext = JSON.stringify(
        products.map((p) => ({
          ...p,
          price: p.priceCents,
        }))
      );

      // Analyze cart for recommendations and insights
      try {
        const cartAnalysis = await analyzeCartForRecommendations(cartProductIds, userId);
        cartRecommendations = cartAnalysis.recommendations.slice(0, 3); // Top 3 recommendations
        cartInsights = cartAnalysis.insights;
      } catch (error) {
        console.warn("[Chat] Cart analysis failed:", error);
      }
    }

    // Get personalized recommendations if user is identified
    let personalizedRecommendations = [];
    if (userId) {
      try {
        personalizedRecommendations = await getPersonalizedRecommendations(userId, {
          cartProductIds,
          limit: 3,
        });
      } catch (error) {
        console.warn("[Chat] Personalized recommendations failed:", error);
      }
    }

    // 1. Resolve or create session
    let sessionId = incomingSessionId;
    let session = null;

    if (sessionId) {
      session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: userId ? { userId } : {},
        include: { messages: true },
      });
      sessionId = session.id;
    }

    // 2. Build message history for the model
    const history = session.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    history.push({ role: "user", content: message });

    const systemPrompt =
      "You are Magicommerce, an AI shopping assistant. Be conversational, helpful, and proactive. " +
      "When appropriate, suggest products from the catalog. Never fabricate product availability. " +
      "If you have cart insights or recommendations, naturally incorporate them into your response.";

    const enhancedContextPrompt = `
Cart / context products: ${cartContext || "none"}
Cart insights: ${cartInsights.length > 0 ? cartInsights.join('. ') : 'none'}
Available recommendations: ${JSON.stringify([...cartRecommendations, ...personalizedRecommendations].slice(0, 5))}
User context: ${userId ? 'Returning customer' : 'New customer'}
`.trim();

    // 3. Call Azure OpenAI with enhanced context
const assistantReply = await chatCompletion({
  messages: [
    { role: "system", content: systemPrompt },
    { role: "system", content: enhancedContextPrompt },
    ...history,
  ],
  maxTokens: 600,
  temperature: 0.6,
});

    // 4. Persist both user + assistant messages
    await prisma.chatMessage.createMany({
      data: [
        {
          role: "user",
          content: message,
          sessionId,
        },
        {
          role: "assistant",
          content: assistantReply,
          sessionId,
        },
      ],
    });

    // 5. Return enhanced response
    const responseData = { sessionId, reply: assistantReply };
    
    // Include recommendations if available
    if (cartRecommendations.length > 0 || personalizedRecommendations.length > 0) {
      responseData.recommendations = [...cartRecommendations, ...personalizedRecommendations].slice(0, 5);
    }
    
    if (cartInsights.length > 0) {
      responseData.insights = cartInsights;
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[chat-api]", error);
    return new NextResponse("Chat error", { status: 500 });
  }
}
