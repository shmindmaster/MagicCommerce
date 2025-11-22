
import Stripe from 'stripe';
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/libs/auth";

export async function POST(req) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const stripe = new Stripe(process.env.STRIPE_SK_KEY || '');

        const res = await stripe.paymentIntents.create({
            amount: Number(body.amount),
            currency: 'gbp',
            automatic_payment_methods: { enabled: true },
        });

        return NextResponse.json(res);
    } catch (error) {
        console.log(error);
        return new NextResponse('Something went wrong', { status: 400 });
    }
}
