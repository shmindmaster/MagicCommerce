# MagicCommerce - AI-Native E-Commerce Platform

**Industry**: E-Commerce  
**Domain**: https://magiccommerce.shtrial.com  
**Type**: Full-stack AI Application (Next.js with API routes)

## Overview

MagicCommerce is an AI-powered e-commerce platform that enhances the shopping experience with intelligent product search, personalized recommendations, AI-powered chat assistance, and visual search capabilities.

## Key AI Features

- **AI Product Search**: Semantic and vector search over product catalog
- **Shopping Assistant**: AI chat assistant for product recommendations and Q&A
- **Personalized Recommendations**: AI-driven product suggestions based on user behavior
- **Price Optimization**: AI analysis of pricing strategies and competitor data
- **Visual Search**: Image-based product discovery

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 18, TypeScript
- **Database**: Azure PostgreSQL (`pg-shared-apps-eastus2`, database: `magicommerce`) via Prisma
- **AI**: Azure OpenAI exclusively
  - Chat: `gpt-5.1-mini`
  - Embeddings: `text-embedding-3-small`
  - Vision: `gpt-image-1-mini`
- **Search**: Azure AI Search (`shared-search-standard-eastus2`, index: `magicommerce-products`)
- **Storage**: Azure Blob Storage (`stmahumsharedapps`, container: `magicommerce-assets`)
- **Deployment**: 
  - Frontend: Azure Static Web App (`rg-shared-web`)
  - Backend: Same SWA (Next.js API routes) or Container App (`rg-shared-apps`) if split later

## Architecture

- **Monorepo**: Single Next.js application
- **API Routes**: Next.js App Router API routes
- **Database**: Prisma ORM with PostgreSQL

## Environment Variables

See `.env.example` for the complete schema. Key variables:

```env
# Azure OpenAI (Standardized - shared across all portfolio apps)
AZURE_OPENAI_ENDPOINT=https://shared-openai-eastus2.openai.azure.com/
AZURE_OPENAI_API_KEY=<your_key>
AZURE_OPENAI_CHAT_DEPLOYMENT=gpt-5.1-mini
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-small
AZURE_OPENAI_IMAGE_DEPLOYMENT=gpt-image-1-mini

# Database (Shared Postgres)
DATABASE_URL=postgresql://<user>:<password>@pg-shared-apps-eastus2.postgres.database.azure.com:5432/magicommerce?sslmode=require

# Azure AI Search
AZURE_SEARCH_ENDPOINT=https://shared-search-standard-eastus2.search.windows.net
AZURE_SEARCH_API_KEY=<your_key>
AZURE_SEARCH_INDEX_NAME_PRODUCTS=magicommerce-products
```

## Setup

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Azure credentials

# Database setup
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database (optional)

# Development
pnpm dev              # Start Next.js dev server
pnpm build            # Build for production
```

## AI Roadmap

- ✅ **Current**: AI product search, shopping assistant, recommendations
- 🔄 **Near-term**: Enhanced personalization, multi-modal search
- 📋 **Future**: Predictive inventory management, automated pricing strategies

## Deployment

Deployed via GitHub Actions workflow (`.github/workflows/deploy.yml`) to Azure Container Apps.


