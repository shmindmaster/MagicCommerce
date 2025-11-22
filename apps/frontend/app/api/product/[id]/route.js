import prisma from "@/app/libs/Prisma";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  try {

    const { id } = context.params;

    const product = await prisma.product.findFirst({
      where: { id: Number(id) },
    });

    if (!product) {
      return new NextResponse("Not found", { status: 404 });
    }

    const result = {
      ...product,
      // Preserve existing contract: price is stored in cents; UI divides by 100
      price: product.priceCents,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.log(error);
    return new NextResponse("Something went wrong", { status: 400 });
  }
}