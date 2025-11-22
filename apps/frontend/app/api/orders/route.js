
import prisma from "@/app/libs/Prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/libs/auth";

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        
        const orders = await prisma.orders.findMany({
            where: { user_id: user.id },
            orderBy: { id: "desc" },
            include: { 
                orderItem: {
                    include: {
                        product: true
                    }
                }
            }
        });
        
        await prisma.$disconnect();
        return NextResponse.json(orders);
    } catch (error) {
        console.log(error);
        await prisma.$disconnect();
        return new NextResponse('Something went wrong', { status: 400 });
    }
}
