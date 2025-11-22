import prisma from "@/app/libs/Prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
  include: {
    category: true,
    reviews: true,
  },
});

    // Preserve existing JSON shape: expose price (in cents) while backing with priceCents
    const result = products.map((p) => ({
      ...p,
      price: p.priceCents,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.log(error);
    return new NextResponse("Something went wrong", { status: 400 });
  }
}