// app/libs/azureOpenAI.js
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_KEY || process.env.AZURE_OPENAI_API_KEY;
const deployment = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
const apiVersion = process.env.AZURE_OPENAI_CHAT_API_VERSION;

if (!endpoint || !apiKey || !deployment || !apiVersion) {
  // Fail fast on misconfig to avoid "mystery no-AI" deployments
  console.warn('[AzureOpenAI] Missing configuration – check environment variables.');
}

export async function chatCompletion({ messages, temperature = 0.3, maxTokens = 512 }) {
  const url = `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('[AzureOpenAI] Error', res.status, text);
    throw new Error(`Azure OpenAI error: ${res.status}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  return choice?.message?.content ?? '';
}
