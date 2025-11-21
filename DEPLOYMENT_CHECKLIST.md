# MagicCommerce – Alpha‑Release Deployment Checklist

## ✅ Local Verification
- [ ] `pnpm install` – all dependencies installed.
- [ ] Copy `.env.example` → `.env.local` and fill **all** Azure/OpenAI/DB variables.
- [ ] `pnpm build` – **Compiled successfully** (no TypeScript errors).
- [ ] `pnpm test:e2e` – **0 test failures**.
- [ ] Manual API sanity checks (curl):
  ```bash
  curl -s "http://localhost:3000/api/products/descriptions?productId=1" | jq .
  curl -X POST -F "image=@sample.jpg" http://localhost:3000/api/products/visual-search | jq .
  curl -X POST -H "Content-Type: application/json" -d '{"message":"What accessories go with a laptop?","userId":"test"}' http://localhost:3000/api/ai/chat | jq .
  ```
  All three should return a JSON payload with the expected fields.

## 🖥️ UI Smoke‑Test (local dev server)
- [ ] `pnpm dev` → open `http://localhost:3000`.
- [ ] **Product page** – click **Generate AI Description** → description appears.
- [ ] **Visual‑search page** (`/visual-search`) – upload an image → analysis result displayed.
- [ ] **AI chat widget** – ask a question → assistant replies and shows recommendations/insights.
- [ ] No JavaScript console errors.

## 📦 Docker Image
- [ ] Log in to Azure (`az login`).
- [ ] Create / reuse an Azure Container Registry (ACR) named `magiccommerceacr`.
- [ ] Build the image:
  ```bash
  docker build -t magiccommerceacr.azurecr.io/magiccommerce:alpha .
  ```
- [ ] Push the image:
  ```bash
  docker push magiccommerceacr.azurecr.io/magiccommerce:alpha
  ```

## 🚀 Azure Container Apps Deployment
- [ ] Create a Container Apps environment (`magiccommerce-env`) if it does not exist.
- [ ] Deploy the container (replace `<ACR_USERNAME>` / `<ACR_PASSWORD>` with your ACR credentials):
  ```bash
  az containerapp create \
    --name magiccommerce-alpha \
    --resource-group rg-shared-web \
    --environment magiccommerce-env \
    --image magiccommerceacr.azurecr.io/magiccommerce:alpha \
    --target-port 8080 \
    --ingress external \
    --cpu 1 --memory 2Gi \
    --registry-server magiccommerceacr.azurecr.io \
    --registry-username <ACR_USERNAME> \
    --registry-password <ACR_PASSWORD> \
    --env-vars \
      AZURE_OPENAI_ENDPOINT=$AZURE_OPENAI_ENDPOINT \
      AZURE_OPENAI_API_KEY=$AZURE_OPENAI_API_KEY \
      AZURE_OPENAI_DEPLOYMENT_CHAT=$AZURE_OPENAI_DEPLOYMENT_CHAT \
      AZURE_OPENAI_DEPLOYMENT_EMBEDDING=$AZURE_OPENAI_DEPLOYMENT_EMBEDDING \
      AZURE_OPENAI_DEPLOYMENT_VISION=$AZURE_OPENAI_DEPLOYMENT_VISION \
      AZURE_OPENAI_API_VERSION=2025-01-01-preview \
      AZURE_SEARCH_ENDPOINT=$AZURE_SEARCH_ENDPOINT \
      AZURE_SEARCH_API_KEY=$AZURE_SEARCH_API_KEY \
      AZURE_SEARCH_INDEX_NAME_PRODUCTS=$AZURE_SEARCH_INDEX_NAME_PRODUCTS \
      DATABASE_URL=$DATABASE_URL \
      AZURE_STORAGE_CONNECTION_STRING=$AZURE_STORAGE_CONNECTION_STRING \
      APP_BLOB_CONTAINER=$APP_BLOB_CONTAINER \
      NEXT_PUBLIC_FEATURE_AI_CHAT=true \
      NEXT_PUBLIC_FEATURE_AI_SEARCH=true \
      NEXT_PUBLIC_FEATURE_AI_PRODUCT_QNA=true \
      NEXT_PUBLIC_FEATURE_VECTOR_SEARCH=true \
      NEXT_PUBLIC_FEATURE_ENHANCED_RECOMMENDATIONS=true \
      NEXT_PUBLIC_FEATURE_VISUAL_SEARCH=true
  ```
- [ ] Verify the output URL (e.g., `https://magiccommerce-alpha.<region>.azurecontainerapps.io`).
- [ ] Open the URL and repeat the **UI Smoke‑Test** steps on the live site.

## 👥 Alpha‑Tester Roll‑out
- [ ] Draft a short email with the public URL and a **quick‑start guide** (product page → AI description, visual‑search, chat widget).
- [ ] Share the URL with the internal tester group.
- [ ] Collect feedback on:
  - UI/UX glitches.
  - API errors or slow responses.
  - AI output quality (hallucinations, relevance).
- [ ] Log all issues in a GitHub issue or shared doc for the next iteration.

---
**When every checkbox is ticked, the MagicCommerce demo is production‑ready for an internal alpha launch.**
