
import prisma from "@/app/libs/Prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/libs/auth";

export async function POST(req) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();

        const order = await prisma.orders.create({
            data: {
                user_id: user.id,
                stripe_id: body.stripe_id,
                name: body.name,
                address: body.address,
                zipcode: body.zipcode,
                city: body.city,
                country: body.country,
                total: Number(body.total),
            }
        });
        
        body.products.forEach(async prod => { 
            await prisma.orderItem.create({
                data: {
                    order_id: order.id,
                    product_id: Number(prod.id),
                }
            });
        });

        await prisma.$disconnect();
        return NextResponse.json('Order Complete', { status: 200 });
    } catch (error) {
        console.log(error);
        await prisma.$disconnect();
        return new NextResponse('Something went wrong', { status: 400 });
    }
}
