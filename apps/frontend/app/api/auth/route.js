
import prisma from "@/app/libs/Prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, name, picture } = body;

        if (!email) {
            return new NextResponse('Email is required', { status: 400 });
        }

        // Find or create user
        let user = await prisma.users.findUnique({
            where: { email }
        });

        if (!user) {
            user = await prisma.users.create({
                data: {
                    email,
                    name,
                    picture
                }
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 // 30 days
        });

        await prisma.$disconnect();
        return NextResponse.json({ user, token });
    } catch (error) {
        console.log(error);
        await prisma.$disconnect();
        return new NextResponse('Something went wrong', { status: 500 });
    }
}

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token');

        if (!token) {
            return new NextResponse('No token found', { status: 401 });
        }

        const decoded = jwt.verify(token.value, JWT_SECRET);
        
        const user = await prisma.users.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        await prisma.$disconnect();
        return NextResponse.json({ user });
    } catch (error) {
        console.log(error);
        await prisma.$disconnect();
        return new NextResponse('Invalid token', { status: 401 });
    }
}

export async function DELETE() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('auth-token');
        return NextResponse.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.log(error);
        return new NextResponse('Something went wrong', { status: 500 });
    }
}
