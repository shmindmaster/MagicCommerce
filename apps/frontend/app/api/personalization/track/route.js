// app/api/personalization/track/route.js
import { NextResponse } from "next/server";
import { trackUserBehavior } from "@/app/libs/personalization";

export async function POST(req) {
  try {
    const { userId, productId, eventType, metadata } = await req.json();

    if (!productId || !eventType) {
      return NextResponse.json(
        { error: "productId and eventType are required" },
        { status: 400 }
      );
    }

    await trackUserBehavior({
      userId: userId || undefined,
      productId: parseInt(productId),
      eventType,
      metadata,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Personalization Track] Error:", error);
    return NextResponse.json(
      { error: "Failed to track behavior" },
      { status: 500 }
    );
  }
}