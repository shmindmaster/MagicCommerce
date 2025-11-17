# Copilot Instructions for MagicCommerce

## Project Overview

**MagicCommerce** is a modern e-commerce platform built with Next.js requiring server-side rendering.

## Azure Infrastructure

### Subscription

- **Subscription ID**: 44e77ffe-2c39-4726-b6f0-2c733c7ffe78 (mahumtech)

### Resource Groups

- **rg-shared-web**: (for Container Apps deployment)
- **rg-shared-dns**: DNS zones (shtrial.com)
- **rg-shared-ai**: Shared AI resources

### Domain Configuration

- **Custom Domain**: https://magiccommerce.shtrial.com
- **DNS Zone**: shtrial.com (in rg-shared-dns)
- **Deployment**: Azure Container Apps (Next.js standalone server)

### Shared AI Resources

- **Azure OpenAI**: shared-openai-eastus2 (https://shared-openai-eastus2.openai.azure.com/)
- **Azure AI Search**: shared-search-eastus2 (https://shared-search-eastus2.search.windows.net)

## GitHub Repository

- **Owner**: shmindmaster
- **Repository**: https://github.com/shmindmaster/MagicCommerce

## Technology Stack

- **Framework**: Next.js 16+ (Server-Side Rendering)
- **Build Mode**: Standalone (output: 'standalone')
- **Database**: Prisma ORM
- **Deployment**: Azure Container Apps (containerized Next.js)

## Build & Deployment

### Docker Build

```bash
# Build Next.js standalone
pnpm build

# Build Docker image
docker build -t magiccommerce .

# Deploy to Azure Container Apps
az containerapp up --name magiccommerce \
  --resource-group rg-shared-web \
  --subscription mahumtech \
  --image <your-acr>.azurecr.io/magiccommerce:latest \
  --target-port 3000 \
  --ingress external
```

## Important Configuration

- **next.config.js**: Has `output: 'standalone'` for containerized deployment
- **Cannot use Static Web Apps**: Requires server-side features (API routes, ISR)

## Environment Variables (Container Apps)

```bash
DATABASE_URL=<postgres-connection-string>
AZURE_OPENAI_ENDPOINT=https://shared-openai-eastus2.openai.azure.com/
AZURE_SEARCH_ENDPOINT=https://shared-search-eastus2.search.windows.net
NEXTAUTH_URL=https://magiccommerce.shtrial.com
NEXTAUTH_SECRET=<from-key-vault>
```

## Agent Behavior Rules

1. Deploy to Azure Container Apps (NOT Static Web Apps)
2. Use standalone Next.js output mode
3. Use shared AI resources exclusively
4. Never create per-app resource groups

## Additional Resources

- [Next.js Standalone Output](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/)
