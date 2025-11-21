import { NextResponse } from 'next/server';
import { analyzeImage } from '@/app/libs/azureComputerVision';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const image = formData.get('image');

    if (!image) {
      return new NextResponse('Image is required', { status: 400 });
    }

    const analysis = await analyzeImage(image);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('[Visual Search API]', error);
    return new NextResponse('Failed to analyze image', { status: 500 });
  }
}