// app/libs/azureSearch.ts
import "server-only";

interface SearchResult {
  id: number;
  title: string;
  description: string;
  priceCents: number;
  imageUrl?: string;
  score?: number;
}

interface SearchOptions {
  query?: string;
  vector?: number[];
  top?: number;
  skip?: number;
  filters?: string;
}

interface AzureSearchResponse {
  value: Array<{
    "@search.score": number;
    id: string;
    title: string;
    description: string;
    priceCents: number;
    imageUrl?: string;
  }>;
}

const endpoint = process.env.AZURE_SEARCH_ENDPOINT!;
const apiKey = process.env.AZURE_SEARCH_API_KEY!;
const indexName = process.env.AZURE_SEARCH_INDEX_NAME_PRODUCTS || "magicommerce-products";
const apiVersion = "2024-07-01";

if (!endpoint || !apiKey) {
  console.warn("[azureSearch] Missing endpoint or apiKey");
}

export class AzureSearchClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = `${endpoint}indexes/${indexName}/docs`;
    this.headers = {
      "Content-Type": "application/json",
      "api-key": apiKey,
    };
  }

  /**
   * Perform hybrid search combining text and vector similarity
   */
  async search(options: SearchOptions): Promise<SearchResult[]> {
    const { query, vector, top = 20, skip = 0, filters } = options;

    if (!query && !vector) {
      throw new Error("Either query or vector must be provided");
    }

    const searchBody: any = {
      top,
      skip,
      count: true,
    };

    // Add text search if query provided
    if (query) {
      searchBody.search = query;
      searchBody.queryType = "semantic";
      searchBody.semanticConfiguration = "default";
      searchBody.speller = "lexicon";
      searchBody.queryLanguage = "en-us";
    }

    // Add vector search if vector provided
    if (vector) {
      searchBody.vectors = [
        {
          value: vector,
          k: top,
          fields: "embedding",
        },
      ];
    }

    // Add filters if provided
    if (filters) {
      searchBody.filter = filters;
    }

    const url = `${this.baseUrl}/search?api-version=${apiVersion}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(searchBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure Search error: ${response.status} - ${errorText}`);
      }

      const data: AzureSearchResponse = await response.json();
      
      return data.value.map((item) => ({
        id: parseInt(item.id),
        title: item.title,
        description: item.description,
        priceCents: item.priceCents,
        imageUrl: item.imageUrl,
        score: item["@search.score"],
      }));
    } catch (error) {
      console.error("[AzureSearch] Search failed:", error);
      throw error;
    }
  }

  /**
   * Upload or update documents in the search index
   */
  async uploadDocuments(documents: SearchResult[]): Promise<void> {
    const url = `${this.baseUrl}/index?api-version=${apiVersion}`;

    const batch = documents.map((doc) => ({
      "@search.action": "upload",
      ...doc,
      id: doc.id.toString(),
    }));

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({ value: batch }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure Search upload error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log(`[AzureSearch] Uploaded ${documents.length} documents:`, result);
    } catch (error) {
      console.error("[AzureSearch] Upload failed:", error);
      throw error;
    }
  }

  /**
   * Delete documents from the search index
   */
  async deleteDocuments(ids: number[]): Promise<void> {
    const url = `${this.baseUrl}/index?api-version=${apiVersion}`;

    const batch = ids.map((id) => ({
      "@search.action": "delete",
      id: id.toString(),
    }));

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({ value: batch }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure Search delete error: ${response.status} - ${errorText}`);
      }

      console.log(`[AzureSearch] Deleted ${ids.length} documents`);
    } catch (error) {
      console.error("[AzureSearch] Delete failed:", error);
      throw error;
    }
  }

  /**
   * Get document count and index statistics
   */
  async getIndexStats(): Promise<{ count: number; storageSize?: number }> {
    const url = `${endpoint}indexes/${indexName}/stats?api-version=${apiVersion}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure Search stats error: ${response.status} - ${errorText}`);
      }

      const stats = await response.json();
      return {
        count: stats["documentCount"],
        storageSize: stats["storageSize"],
      };
    } catch (error) {
      console.error("[AzureSearch] Stats failed:", error);
      throw error;
    }
  }
}

// Singleton instance
let searchClient: AzureSearchClient | null = null;

export function getAzureSearchClient(): AzureSearchClient {
  if (!searchClient) {
    searchClient = new AzureSearchClient();
  }
  return searchClient;
}

/**
 * Generate embeddings for search using Azure OpenAI
 */
export async function generateSearchEmbedding(text: string): Promise<number[]> {
  const { getEmbeddings } = await import("./azureOpenAI");
  return getEmbeddings(text);
}

/**
 * Perform semantic search with automatic embedding generation
 */
export async function semanticSearch(query: string, top: number = 20): Promise<SearchResult[]> {
  try {
    // Generate embedding for the query
    const embedding = await generateSearchEmbedding(query);
    
    // Perform hybrid search
    const client = getAzureSearchClient();
    return await client.search({
      query,
      vector: embedding,
      top,
    });
  } catch (error) {
    console.error("[semanticSearch] Failed:", error);
    throw error;
  }
}

/**
 * Perform vector-only search for recommendations
 */
export async function vectorSearch(embedding: number[], top: number = 10): Promise<SearchResult[]> {
  try {
    const client = getAzureSearchClient();
    return await client.search({
      vector: embedding,
      top,
    });
  } catch (error) {
    console.error("[vectorSearch] Failed:", error);
    throw error;
  }
}