// app/api/analytics/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/Prisma";

export async function POST(req: NextRequest) {
  try {
    const { event, productId, meta, userId } = await req.json();

    if (!event || typeof event !== "string") {
      return new NextResponse("event is required", { status: 400 });
    }

    await prisma.userEvent.create({
      data: {
        event,
        productId: productId ?? null,
        meta: meta ?? {},
        userId: userId ?? null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[analytics-track]", error);
    return new NextResponse("Analytics error", { status: 500 });
  }
}
