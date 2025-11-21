import "server-only";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
const apiKey = process.env.AZURE_OPENAI_API_KEY!;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview";
const visionDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_VISION || "gpt-4o-mini";

/**
 * Analyze an image using Azure OpenAI Vision model (gpt-4o-mini).
 * The function accepts a File/Blob, converts it to base64, and sends it as a multipart request.
 * For simplicity, we return the raw response content.
 */
export async function analyzeImage(image: File | Blob): Promise<any> {
  try {
    const arrayBuffer = await (image instanceof File ? image.arrayBuffer() : image.arrayBuffer());
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const url = `${endpoint}openai/deployments/${visionDeployment}/chat/completions?api-version=${apiVersion}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Describe the image and list any recognizable products." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } },
            ],
          },
        ],
        max_tokens: 512,
        temperature: 0.5,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Vision API error ${res.status}: ${txt}`);
    }
    const data = await res.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error("[azureComputerVision]", err);
    // Fallback placeholder
    return { description: "Unable to analyze image at this time." };
  }
}
