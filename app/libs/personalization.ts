// app/libs/personalization.ts
import "server-only";
import prisma from "./Prisma";
import { chatCompletion } from "./azureOpenAI";

interface UserBehavior {
  userId?: string;
  productId: number;
  eventType: 'view' | 'search' | 'cart_add' | 'purchase' | 'chat_question';
  metadata?: any;
}

interface ProductRecommendation {
  id: number;
  title: string;
  description: string;
  priceCents: number;
  imageUrl?: string;
  score: number;
  reason: string;
}

/**
 * Track user behavior for personalization
 */
export async function trackUserBehavior(behavior: UserBehavior): Promise<void> {
  try {
    await prisma.userEvent.create({
      data: {
        userId: behavior.userId,
        event: behavior.eventType,
        productId: behavior.productId,
        meta: behavior.metadata,
      },
    });
  } catch (error) {
    console.error("[Personalization] Failed to track behavior:", error);
  }
}

/**
 * Get user's recent behavior for personalization
 */
export async function getUserBehaviorProfile(userId?: string, limit: number = 20): Promise<UserBehavior[]> {
  if (!userId) return [];

  try {
    const events = await prisma.userEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        userId: true,
        productId: true,
        event: true,
        meta: true,
      },
    });

    return events.map((event: any) => ({
      userId: event.userId || undefined,
      productId: event.productId,
      eventType: event.event as any,
      metadata: event.meta,
    }));
  } catch (error) {
    console.error("[Personalization] Failed to get user profile:", error);
    return [];
  }
}

/**
 * Get user's preferred categories based on behavior
 */
export async function getUserPreferences(userId?: string): Promise<string[]> {
  if (!userId) return [];

  try {
    // Get products user has interacted with
    const events = await prisma.userEvent.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            title: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Extract keywords from product titles and descriptions
    const productTexts = events.map((event: any) => 
      `${event.product.title} ${event.product.description}`
    ).join(' ');

    if (!productTexts.trim()) return [];

    // Use AI to extract preferences
    const preferences = await chatCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are an e-commerce personalization engine. Extract 5-10 key product categories or preferences from user behavior. Return only a JSON array of strings.',
        },
        {
          role: 'user',
          content: `Extract user preferences from these product interactions: ${productTexts}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 200,
    });

    try {
      return JSON.parse(preferences);
    } catch {
      return [];
    }
  } catch (error) {
    console.error("[Personalization] Failed to get user preferences:", error);
    return [];
  }
}

/**
 * Generate personalized product recommendations
 */
export async function getPersonalizedRecommendations(
  userId?: string,
  context?: {
    currentProductId?: number;
    cartProductIds?: number[];
    limit?: number;
  }
): Promise<ProductRecommendation[]> {
  const limit = context?.limit || 10;
  
  try {
    // Get user behavior and preferences
    const [userBehavior, userPreferences] = await Promise.all([
      getUserBehaviorProfile(userId),
      getUserPreferences(userId),
    ]);

    // Get candidate products
    const candidates = await prisma.product.findMany({
      where: {
        id: {
          not: context?.currentProductId,
          notIn: context?.cartProductIds,
        },
      },
      take: 50,
      select: {
        id: true,
        title: true,
        description: true,
        priceCents: true,
        imageUrl: true,
      },
    });

    if (candidates.length === 0) return [];

    // Use AI to rank and select recommendations
    const aiInstruction = `
Given the user's behavior and preferences, rank these products and select the top ${limit} recommendations.
Consider:
- User's past interactions: ${JSON.stringify(userBehavior.slice(0, 5))}
- User preferences: ${JSON.stringify(userPreferences)}
- Current context: ${JSON.stringify(context)}

Return a JSON array of objects with: {id, score (0-1), reason (brief explanation)}.

Candidates: ${JSON.stringify(candidates)}
`.trim();

    const aiResponse = await chatCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are an e-commerce recommendation engine. Return only valid JSON arrays with product rankings.',
        },
        { role: 'user', content: aiInstruction },
      ],
      temperature: 0.4,
      maxTokens: 800,
    });

    let rankings: Array<{id: number, score: number, reason: string}> = [];
    try {
      rankings = JSON.parse(aiResponse);
    } catch {
      // Fallback: return top candidates with default scores
      return candidates.slice(0, limit).map((product: any, index: number) => ({
        ...product,
        score: 1 - (index * 0.1),
        reason: 'Popular product',
      }));
    }

    // Merge rankings with product data
    const recommendations: ProductRecommendation[] = rankings
      .filter(ranking => ranking.score > 0.3) // Filter low-confidence recommendations
      .slice(0, limit)
      .map(ranking => {
        const product = candidates.find((p: any) => p.id === ranking.id);
        if (!product) return null;
        
        return {
          ...product,
          score: ranking.score,
          reason: ranking.reason,
        };
      })
      .filter(Boolean) as ProductRecommendation[];

    return recommendations;
  } catch (error) {
    console.error("[Personalization] Failed to generate recommendations:", error);
    return [];
  }
}

/**
 * Analyze cart and provide recommendations
 */
export async function analyzeCartForRecommendations(
  cartProductIds: number[],
  userId?: string
): Promise<{
  recommendations: ProductRecommendation[];
  insights: string[];
}> {
  try {
    // Get cart products
    const cartProducts = await prisma.product.findMany({
      where: { id: { in: cartProductIds } },
      select: {
        id: true,
        title: true,
        description: true,
        priceCents: true,
      },
    });

    if (cartProducts.length === 0) {
      return { recommendations: [], insights: [] };
    }

    // Get user preferences for context
    const userPreferences = await getUserPreferences(userId);

    // Get complementary products using AI
    const aiInstruction = `
Analyze this shopping cart and provide recommendations and insights.

Cart Products: ${JSON.stringify(cartProducts)}
User Preferences: ${JSON.stringify(userPreferences)}

Return a JSON object with:
{
  "recommendations": [{id, score (0-1), reason}],
  "insights": ["insight 1", "insight 2"]
}

Recommendations should be complementary items, upgrades, or accessories.
Insights should be helpful observations about the cart.
`.trim();

    const aiResponse = await chatCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are an e-commerce cart analyst. Provide helpful recommendations and insights. Return only valid JSON.',
        },
        { role: 'user', content: aiInstruction },
      ],
      temperature: 0.5,
      maxTokens: 600,
    });

    let analysis: { recommendations: any[], insights: string[] };
    try {
      analysis = JSON.parse(aiResponse);
    } catch {
      return { recommendations: [], insights: [] };
    }

    // Get full product data for recommendations
    const recommendedIds = analysis.recommendations.map((r: any) => r.id);
    const recommendedProducts = await prisma.product.findMany({
      where: { 
        id: { in: recommendedIds },
        id: { notIn: cartProductIds }, // Exclude items already in cart
      },
      select: {
        id: true,
        title: true,
        description: true,
        priceCents: true,
        imageUrl: true,
      },
    });

    // Merge with AI rankings
    const recommendations: ProductRecommendation[] = analysis.recommendations
      .map((ranking: any) => {
        const product = recommendedProducts.find(p => p.id === ranking.id);
        if (!product) return null;
        
        return {
          ...product,
          score: ranking.score,
          reason: ranking.reason,
        };
      })
      .filter(Boolean) as ProductRecommendation[];

    return {
      recommendations,
      insights: analysis.insights || [],
    };
  } catch (error) {
    console.error("[Personalization] Failed to analyze cart:", error);
    return { recommendations: [], insights: [] };
  }
}