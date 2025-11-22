// app/api/admin/embeddings/route.js
import { NextResponse } from "next/server";
import { initializeEmbeddings, checkSearchIndexHealth } from "@/app/libs/embeddingGenerator";

// Admin endpoint to initialize embeddings for all products
// This should be protected by authentication in production

export async function POST(req) {
  try {
    const { action } = await req.json();

    switch (action) {
      case "initialize":
        await initializeEmbeddings();
        return NextResponse.json({ 
          success: true, 
          message: "Embeddings initialization started" 
        });

      case "health":
        const isHealthy = await checkSearchIndexHealth();
        return NextResponse.json({ 
          success: true, 
          healthy: isHealthy,
          message: isHealthy ? "Search index is healthy" : "Search index needs initialization"
        });

      default:
        return NextResponse.json(
          { error: "Invalid action. Use 'initialize' or 'health'" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[Embeddings Admin] Error:", error);
    return NextResponse.json(
      { error: "Failed to process embeddings request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const isHealthy = await checkSearchIndexHealth();
    return NextResponse.json({ 
      success: true, 
      healthy: isHealthy,
      message: isHealthy ? "Search index is healthy" : "Search index needs initialization"
    });
  } catch (error) {
    console.error("[Embeddings Admin] Health check failed:", error);
    return NextResponse.json(
      { error: "Failed to check search index health" },
      { status: 500 }
    );
  }
}