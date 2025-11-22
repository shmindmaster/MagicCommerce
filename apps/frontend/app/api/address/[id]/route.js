
import prisma from "@/app/libs/Prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/libs/auth";

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        
        const res = await prisma.addresses.findFirst({
            where: { user_id: user.id }
        });
        
        await prisma.$disconnect();
        return NextResponse.json(res);
    } catch (error) {
        console.log(error);
        await prisma.$disconnect();
        return new NextResponse('Something went wrong', { status: 400 });
    }
}
