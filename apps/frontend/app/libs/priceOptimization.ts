// app/libs/priceOptimization.ts
import 'server-only';
import prisma from './Prisma';
import { chatCompletion } from './azureOpenAI';

interface PriceAnalysis {
  productId: number;
  currentPrice: number;
  recommendedPrice: number;
  confidence: number;
  reasoning: string;
  marketPosition: 'premium' | 'competitive' | 'budget';
  priceElasticity: 'high' | 'medium' | 'low';
}

interface CompetitorAnalysis {
  competitorName: string;
  price: number;
  position: 'higher' | 'lower' | 'same';
  difference: number;
}

/**
 * Analyze product pricing and provide optimization recommendations
 */
export async function analyzeProductPricing(productId: number): Promise<{
  analysis: PriceAnalysis;
  competitors: CompetitorAnalysis[];
  insights: string[];
}> {
  try {
    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        description: true,
        priceCents: true,
      },
    });

    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    // Get similar products for competitive analysis
    const similarProducts = await prisma.product.findMany({
      where: {
        id: { not: productId },
        OR: [
          {
            title: {
              contains: product.title.split(' ')[0],
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: product.title.split(' ')[0],
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        priceCents: true,
      },
      take: 10,
    });

    // Use AI to analyze pricing
    const aiInstruction = `
Analyze the pricing for this product and provide optimization recommendations.

Product: ${JSON.stringify({
      title: product.title,
      description: product.description,
      currentPrice: product.priceCents / 100,
    })}

Similar products in market: ${JSON.stringify(
      similarProducts.map((p: { title: string; priceCents: number }) => ({
        title: p.title,
        price: p.priceCents / 100,
      }))
    )}

Return a JSON object with:
{
  "analysis": {
    "recommendedPrice": number (in dollars),
    "confidence": number (0-1),
    "reasoning": "detailed explanation",
    "marketPosition": "premium|competitive|budget",
    "priceElasticity": "high|medium|low"
  },
  "competitors": [
    {
      "competitorName": "string",
      "price": number,
      "position": "higher|lower|same",
      "difference": number
    }
  ],
  "insights": ["insight 1", "insight 2", "insight 3"]
}

Consider factors like:
- Competitive positioning
- Price elasticity based on product type
- Market trends
- Value proposition
- Target audience
`.trim();

    const aiResponse = await chatCompletion({
      messages: [
        {
          role: 'system',
          content:
            'You are an e-commerce pricing analyst. Provide data-driven pricing recommendations. Return only valid JSON.',
        },
        { role: 'user', content: aiInstruction },
      ],
      temperature: 0.3,
      maxTokens: 800,
    });

    let analysis: any;
    try {
      analysis = JSON.parse(aiResponse);
    } catch {
      throw new Error('Failed to parse AI pricing analysis');
    }

    // Convert recommended price to cents
    const priceAnalysis: PriceAnalysis = {
      productId: product.id,
      currentPrice: product.priceCents,
      recommendedPrice: Math.round(analysis.analysis.recommendedPrice * 100),
      confidence: analysis.analysis.confidence,
      reasoning: analysis.analysis.reasoning,
      marketPosition: analysis.analysis.marketPosition,
      priceElasticity: analysis.analysis.priceElasticity,
    };

    return {
      analysis: priceAnalysis,
      competitors: analysis.competitors || [],
      insights: analysis.insights || [],
    };
  } catch (error) {
    console.error('[PriceOptimization] Analysis failed:', error);
    throw error;
  }
}

/**
 * Get pricing insights for a product category
 */
export async function getCategoryPricingInsights(category: string): Promise<{
  averagePrice: number;
  priceRange: { min: number; max: number };
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendations: string[];
}> {
  try {
    // Get products in category (based on title/description keywords)
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: category, mode: 'insensitive' } },
          { description: { contains: category, mode: 'insensitive' } },
        ],
      },
      select: {
        priceCents: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    if (products.length === 0) {
      throw new Error(`No products found for category: ${category}`);
    }

    const prices = products.map((p: { priceCents: number }) => p.priceCents);
    const averagePrice = Math.round(
      prices.reduce((sum: number, price: number) => sum + price, 0) /
        prices.length
    );
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Analyze price trend (compare recent vs older products)
    const recentProducts = products.slice(0, Math.floor(products.length / 2));
    const olderProducts = products.slice(Math.floor(products.length / 2));

    const recentAvg =
      recentProducts.reduce(
        (sum: number, p: { priceCents: number }) => sum + p.priceCents,
        0
      ) / recentProducts.length;
    const olderAvg =
      olderProducts.reduce(
        (sum: number, p: { priceCents: number }) => sum + p.priceCents,
        0
      ) / olderProducts.length;

    let trend: 'increasing' | 'decreasing' | 'stable';
    const priceChange = (recentAvg - olderAvg) / olderAvg;
    if (priceChange > 0.05) {
      trend = 'increasing';
    } else if (priceChange < -0.05) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    // Get AI recommendations for the category
    const aiInstruction = `
Provide pricing strategy recommendations for the "${category}" product category.

Category data:
- Average price: $${(averagePrice / 100).toFixed(2)}
- Price range: $${(minPrice / 100).toFixed(2)} - $${(maxPrice / 100).toFixed(2)}
- Recent trend: ${trend}

Return a JSON array of 3-5 actionable pricing recommendations as strings.
`.trim();

    const aiResponse = await chatCompletion({
      messages: [
        {
          role: 'system',
          content:
            'You are an e-commerce pricing strategist. Provide actionable recommendations. Return only a JSON array of strings.',
        },
        { role: 'user', content: aiInstruction },
      ],
      temperature: 0.4,
      maxTokens: 300,
    });

    let recommendations: string[] = [];
    try {
      recommendations = JSON.parse(aiResponse);
    } catch {
      recommendations = [
        'Monitor competitor pricing regularly',
        'Consider seasonal price adjustments',
      ];
    }

    return {
      averagePrice,
      priceRange: { min: minPrice, max: maxPrice },
      trend,
      recommendations,
    };
  } catch (error) {
    console.error('[PriceOptimization] Category insights failed:', error);
    throw error;
  }
}

/**
 * Simulate price change impact on revenue
 */
export async function simulatePriceImpact(
  productId: number,
  newPriceCents: number
): Promise<{
  projectedRevenueChange: number;
  projectedDemandChange: number;
  confidence: number;
  assumptions: string[];
}> {
  try {
    // Get product historical data (simplified - in real app would have sales data)
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        title: true,
        description: true,
        priceCents: true,
      },
    });

    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    const priceChange =
      (newPriceCents - product.priceCents) / product.priceCents;

    // Use AI to estimate price elasticity and impact
    const aiInstruction = `
Estimate the impact of a price change for this product.

Product: ${product.title}
Current price: $${(product.priceCents / 100).toFixed(2)}
New price: $${(newPriceCents / 100).toFixed(2)}
Price change: ${(priceChange * 100).toFixed(1)}%

Return a JSON object with:
{
  "projectedDemandChange": number (percentage, e.g., -0.15 for -15%),
  "confidence": number (0-1),
  "assumptions": ["assumption 1", "assumption 2"]
}

Consider price elasticity based on product type, competition, and value proposition.
`.trim();

    const aiResponse = await chatCompletion({
      messages: [
        {
          role: 'system',
          content:
            'You are an e-commerce revenue analyst. Estimate price elasticity impacts. Return only valid JSON.',
        },
        { role: 'user', content: aiInstruction },
      ],
      temperature: 0.3,
      maxTokens: 400,
    });

    let simulation: any;
    try {
      simulation = JSON.parse(aiResponse);
    } catch {
      // Fallback estimates
      simulation = {
        projectedDemandChange: -priceChange * 1.5, // Basic elasticity assumption
        confidence: 0.5,
        assumptions: [
          'Basic price elasticity applied',
          'No historical data available',
        ],
      };
    }

    const projectedRevenueChange =
      (1 + priceChange) * (1 + simulation.projectedDemandChange) - 1;

    return {
      projectedRevenueChange,
      projectedDemandChange: simulation.projectedDemandChange,
      confidence: simulation.confidence,
      assumptions: simulation.assumptions || [],
    };
  } catch (error) {
    console.error('[PriceOptimization] Simulation failed:', error);
    throw error;
  }
}
