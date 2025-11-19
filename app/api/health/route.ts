import { NextResponse } from "next/server";
import prisma from "@/app/libs/Prisma";
import { BlobServiceClient } from "@azure/storage-blob";
import { chatCompletion } from "@/app/libs/azureOpenAI";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const db: { ok: boolean; error: string | null } = { ok: false, error: null };
  const openai: { ok: boolean; error: string | null } = {
    ok: false,
    error: null,
  };
  const storage: { ok: boolean; error: string | null } = {
    ok: false,
    error: null,
  };

  // Database health: simple count query against Product table
  try {
    await prisma.product.count();
    db.ok = true;
  } catch (err: any) {
    db.error = err?.message || "Unknown database error";
  }

  // Azure OpenAI health: lightweight chat completion via shared client
  try {
    await chatCompletion({
      messages: [
        { role: "user", content: "Health check ping" },
      ],
      maxTokens: 5,
    });
    openai.ok = true;
  } catch (err: any) {
    openai.error = err?.message || "Unknown Azure OpenAI error";
  }

  // Azure Storage health: check that the main container exists
  try {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName =
      process.env.APP_BLOB_CONTAINER || "magicommerce-assets";

    if (!connectionString) {
      storage.error = "AZURE_STORAGE_CONNECTION_STRING is not set";
    } else {
      const blobServiceClient = BlobServiceClient.fromConnectionString(
        connectionString,
      );
      const containerClient = blobServiceClient.getContainerClient(
        containerName,
      );
      const exists = await containerClient.exists();

      if (exists) {
        storage.ok = true;
      } else {
        storage.error = `Container ${containerName} does not exist`;
      }
    }
  } catch (err: any) {
    storage.error = err?.message || "Unknown Azure Storage error";
  }

  const ok = db.ok && openai.ok && storage.ok;

  return NextResponse.json(
    {
      ok,
      db,
      openai,
      storage,
    },
    { status: ok ? 200 : 500 },
  );
}
