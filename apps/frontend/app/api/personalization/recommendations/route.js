// app/api/personalization/recommendations/route.js
import { NextResponse } from "next/server";
import { getPersonalizedRecommendations } from "@/app/libs/personalization";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;
    const currentProductId = searchParams.get("currentProductId") ? parseInt(searchParams.get("currentProductId")) : undefined;
    const cartProductIds = searchParams.get("cartProductIds") 
      ? searchParams.get("cartProductIds").split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : [];
    const limit = parseInt(searchParams.get("limit") || "10");

    const recommendations = await getPersonalizedRecommendations(userId, {
      currentProductId,
      cartProductIds,
      limit,
    });

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error("[Personalization API] Error:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}