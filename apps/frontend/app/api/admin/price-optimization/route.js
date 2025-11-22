// app/api/admin/price-optimization/route.js
import { NextResponse } from "next/server";
import { analyzeProductPricing, getCategoryPricingInsights, simulatePriceImpact } from "@/app/libs/priceOptimization";

export async function POST(req) {
  try {
    const { action, productId, category, newPriceCents } = await req.json();

    switch (action) {
      case "analyze":
        if (!productId) {
          return NextResponse.json(
            { error: "productId is required for analysis" },
            { status: 400 }
          );
        }
        const analysis = await analyzeProductPricing(parseInt(productId));
        return NextResponse.json({ success: true, ...analysis });

      case "category":
        if (!category) {
          return NextResponse.json(
            { error: "category is required for category insights" },
            { status: 400 }
          );
        }
        const categoryInsights = await getCategoryPricingInsights(category);
        return NextResponse.json({ success: true, ...categoryInsights });

      case "simulate":
        if (!productId || !newPriceCents) {
          return NextResponse.json(
            { error: "productId and newPriceCents are required for simulation" },
            { status: 400 }
          );
        }
        const simulation = await simulatePriceImpact(
          parseInt(productId),
          parseInt(newPriceCents)
        );
        return NextResponse.json({ success: true, ...simulation });

      default:
        return NextResponse.json(
          { error: "Invalid action. Use 'analyze', 'category', or 'simulate'" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[Price Optimization Admin] Error:", error);
    return NextResponse.json(
      { error: "Failed to process price optimization request" },
      { status: 500 }
    );
  }
}