// app/api/admin/generate-descriptions/route.js
import { NextResponse } from "next/server";
import { chatCompletion } from "@/app/libs/azureOpenAI";

export async function POST(req) {
  try {
    const { productTitle, productCategory, targetAudience, tone, features } = await req.json();

    if (!productTitle) {
      return NextResponse.json(
        { error: "productTitle is required" },
        { status: 400 }
      );
    }

    // Generate comprehensive product description
    const descriptionPrompt = `
Generate a compelling e-commerce product description for:

Product Title: ${productTitle}
Category: ${productCategory || 'General'}
Target Audience: ${targetAudience || 'General consumers'}
Tone: ${tone || 'Professional and engaging'}
Key Features: ${features || 'Not specified'}

Requirements:
- 2-3 paragraphs, 150-250 words total
- Include SEO-friendly keywords naturally
- Highlight benefits, not just features
- Include a call-to-action
- Use persuasive language
- Format with clear paragraphs

Return ONLY the product description text, no JSON formatting.
`.trim();

    const description = await chatCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are an expert e-commerce copywriter. Create compelling, SEO-optimized product descriptions that drive conversions.',
        },
        { role: 'user', content: descriptionPrompt },
      ],
      temperature: 0.7,
      maxTokens: 400,
    });

    // Generate SEO keywords
    const keywordsPrompt = `
Generate 8-12 SEO keywords for this product:

Product Title: ${productTitle}
Category: ${productCategory || 'General'}
Description: ${description}

Return ONLY a JSON array of keyword strings, no other text.
`.trim();

    let keywords = [];
    try {
      const keywordsResponse = await chatCompletion({
        messages: [
          {
            role: 'system',
            content: 'You are an SEO specialist. Generate relevant keywords for e-commerce products. Return only JSON arrays.',
          },
          { role: 'user', content: keywordsPrompt },
        ],
        temperature: 0.3,
        maxTokens: 200,
      });
      keywords = JSON.parse(keywordsResponse);
    } catch (error) {
      console.warn("[Description Generator] Keywords parsing failed:", error);
      keywords = [productTitle.toLowerCase(), productCategory?.toLowerCase() || 'product'];
    }

    // Generate short tagline
    const taglinePrompt = `
Create a catchy, memorable tagline (under 10 words) for this product:

Product Title: ${productTitle}
Category: ${productCategory || 'General'}

Return ONLY the tagline text, no quotes or formatting.
`.trim();

    const tagline = await chatCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are a marketing copywriter. Create short, impactful taglines.',
        },
        { role: 'user', content: taglinePrompt },
      ],
      temperature: 0.8,
      maxTokens: 50,
    });

    return NextResponse.json({
      success: true,
      description: description.trim(),
      keywords,
      tagline: tagline.trim(),
    });
  } catch (error) {
    console.error("[Description Generator] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate product description" },
      { status: 500 }
    );
  }
}