// app/libs/azureOpenAI.ts
import "server-only";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
const apiKey = process.env.AZURE_OPENAI_API_KEY!;
const apiVersion =
  process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview";

// Standardized deployment names (shared across all portfolio apps)
const chatDeployment =
  process.env.AZURE_OPENAI_DEPLOYMENT_CHAT || process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || "gpt-5.1-mini";
const embedDeployment =
  process.env.AZURE_OPENAI_DEPLOYMENT_EMBEDDING || process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || "text-embedding-3-small";
const visionDeployment =
  process.env.AZURE_OPENAI_DEPLOYMENT_VISION || process.env.AZURE_OPENAI_IMAGE_DEPLOYMENT || "gpt-image-1-mini";

if (!endpoint || !apiKey) {
  // Fail fast in dev; in prod this should be set in Azure config
  console.warn("[azureOpenAI] Missing endpoint or apiKey");
}

export async function chatCompletion(options: {
  messages: { role: "system" | "user" | "assistant"; content: any }[];
  maxTokens?: number;
  temperature?: number;
}) {
  const url = `${endpoint}openai/deployments/${chatDeployment}/chat/completions?api-version=${apiVersion}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      messages: options.messages,
      max_tokens: options.maxTokens ?? 512,
      temperature: options.temperature ?? 0.4,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Azure Chat error: ${res.status} - ${text}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}

export async function getEmbeddings(text: string): Promise<number[]> {
  const url = `${endpoint}openai/deployments/${embedDeployment}/embeddings?api-version=${apiVersion}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({ input: text }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Embedding error: ${res.status} - ${text}`);
  }

  const data = await res.json();
  return data.data[0].embedding as number[];
}
