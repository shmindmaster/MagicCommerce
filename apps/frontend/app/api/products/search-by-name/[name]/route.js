import prisma from "@/app/libs/Prisma";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  try {
    const { name } = context.params;

    const items = await prisma.product.findMany({
      take: 5,
      where: {
        title: {
          contains: name,
          mode: "insensitive",
        },
      },
    });

    const result = items.map((p) => ({
      ...p,
      price: p.priceCents,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.log(error);
    return new NextResponse("Something went wrong", { status: 400 });
  }
}