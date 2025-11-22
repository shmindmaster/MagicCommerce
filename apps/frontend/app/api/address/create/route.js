
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
        
        const res = await prisma.addresses.create({
            data: {
                user_id: user.id,
                name: body.name,
                address: body.address,
                zipcode: body.zipcode,
                city: body.city,
                country: body.country,
            }
        });
        
        await prisma.$disconnect();
        return NextResponse.json(res);
    } catch (error) {
        console.log(error);
        await prisma.$disconnect();
        return new NextResponse('Something went wrong', { status: 400 });
    }
}
