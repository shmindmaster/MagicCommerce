// app/libs/embeddingGenerator.ts
import 'server-only';
import prisma from './Prisma';
import { getEmbeddings } from './azureOpenAI';
import { getAzureSearchClient } from './azureSearch';

interface ProductEmbedding {
  id: number;
  title: string;
  description: string;
  priceCents: number;
  imageUrl?: string;
  embedding?: number[];
}

/**
 * Generate embedding text for a product
 */
function generateProductEmbeddingText(product: ProductEmbedding): string {
  const parts = [
    product.title,
    product.description,
    `Price: $${(product.priceCents / 100).toFixed(2)}`,
  ];

  // Add category information if available
  if (product.description) {
    // Extract potential keywords from description
    const keywords = product.description
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .slice(0, 10);
    parts.push(keywords.join(' '));
  }

  return parts.join(' ');
}

/**
 * Generate embedding for a single product
 */
export async function generateProductEmbedding(
  product: ProductEmbedding
): Promise<number[]> {
  const embeddingText = generateProductEmbeddingText(product);
  return await getEmbeddings(embeddingText);
}

/**
 * Generate and store embeddings for all products
 */
export async function generateAllProductEmbeddings(): Promise<void> {
  console.log('[EmbeddingGenerator] Starting batch embedding generation...');

  try {
    // Fetch all products from database
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        priceCents: true,
        imageUrl: true,
      },
    });

    console.log(
      `[EmbeddingGenerator] Processing ${products.length} products...`
    );

    // Process products in batches to avoid rate limits
    const batchSize = 10;
    const searchClient = getAzureSearchClient();

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const productsWithEmbeddings: ProductEmbedding[] = [];

      // Generate embeddings for this batch
      for (const product of batch) {
        try {
          const embedding = await generateProductEmbedding({
            ...product,
            imageUrl: product.imageUrl ?? undefined,
          });
          productsWithEmbeddings.push({
            ...product,
            imageUrl: product.imageUrl ?? undefined,
            embedding,
          });

          console.log(
            `[EmbeddingGenerator] Generated embedding for product ${product.id}: ${product.title}`
          );
        } catch (error) {
          console.error(
            `[EmbeddingGenerator] Failed to generate embedding for product ${product.id}:`,
            error
          );
          // Continue without embedding for this product
          productsWithEmbeddings.push({
            ...product,
            imageUrl: product.imageUrl ?? undefined,
          });
        }
      }

      // Upload batch to Azure Search
      try {
        await searchClient.uploadDocuments(productsWithEmbeddings);
        console.log(
          `[EmbeddingGenerator] Uploaded batch ${
            Math.floor(i / batchSize) + 1
          }/${Math.ceil(products.length / batchSize)}`
        );
      } catch (error) {
        console.error(
          `[EmbeddingGenerator] Failed to upload batch ${
            Math.floor(i / batchSize) + 1
          }:`,
          error
        );
      }

      // Small delay between batches to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('[EmbeddingGenerator] Batch embedding generation completed!');
  } catch (error) {
    console.error('[EmbeddingGenerator] Batch generation failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Generate embedding for a single product and update it in Azure Search
 */
export async function updateProductEmbedding(productId: number): Promise<void> {
  try {
    // Fetch product from database
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        description: true,
        priceCents: true,
        imageUrl: true,
      },
    });

    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    // Generate embedding
    const embedding = await generateProductEmbedding({
      ...product,
      imageUrl: product.imageUrl ?? undefined,
    });
    const productWithEmbedding = {
      ...product,
      imageUrl: product.imageUrl ?? undefined,
      embedding,
    };

    // Update in Azure Search
    const searchClient = getAzureSearchClient();
    await searchClient.uploadDocuments([productWithEmbedding]);

    console.log(
      `[EmbeddingGenerator] Updated embedding for product ${productId}: ${product.title}`
    );
  } catch (error) {
    console.error(
      `[EmbeddingGenerator] Failed to update product ${productId}:`,
      error
    );
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Delete product embedding from Azure Search
 */
export async function deleteProductEmbedding(productId: number): Promise<void> {
  try {
    const searchClient = getAzureSearchClient();
    await searchClient.deleteDocuments([productId]);

    console.log(
      `[EmbeddingGenerator] Deleted embedding for product ${productId}`
    );
  } catch (error) {
    console.error(
      `[EmbeddingGenerator] Failed to delete product ${productId}:`,
      error
    );
    throw error;
  }
}

/**
 * Check if Azure Search index is properly configured
 */
export async function checkSearchIndexHealth(): Promise<boolean> {
  try {
    const searchClient = getAzureSearchClient();
    const stats = await searchClient.getIndexStats();

    console.log(`[EmbeddingGenerator] Search index stats:`, stats);
    return stats.count > 0;
  } catch (error) {
    console.error(
      '[EmbeddingGenerator] Search index health check failed:',
      error
    );
    return false;
  }
}

/**
 * CLI script to initialize embeddings for all products
 */
export async function initializeEmbeddings(): Promise<void> {
  console.log('[EmbeddingGenerator] Initializing product embeddings...');

  // Check if search index is healthy
  const isHealthy = await checkSearchIndexHealth();
  if (!isHealthy) {
    console.warn(
      '[EmbeddingGenerator] Search index appears to be empty or unhealthy'
    );
  }

  // Generate embeddings for all products
  await generateAllProductEmbeddings();

  console.log('[EmbeddingGenerator] Initialization completed!');
}
