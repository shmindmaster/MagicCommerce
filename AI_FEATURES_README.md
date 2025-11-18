# AI-Powered Features for MagicCommerce

This document describes the AI-powered features implemented in MagicCommerce using Azure OpenAI services.

## Overview

MagicCommerce now includes four major AI-powered features:
1. **AI Shopping Assistant Chat** - Conversational AI for product discovery
2. **AI-Augmented Search** - Semantic search with query expansion
3. **AI Product Q&A** - Product-specific question answering
4. **AI-Assisted Recommendations** - Intelligent product recommendations

## Architecture

### Core Infrastructure

#### Azure OpenAI Client (`app/libs/azureOpenAI.js`)
Shared library for Azure OpenAI API calls:
- Centralized configuration management
- Error handling and logging
- Reusable `chatCompletion()` function

#### Feature Flags (`app/libs/config.js`)
Runtime feature toggles:
```javascript
export const features = {
  aiChat: process.env.NEXT_PUBLIC_FEATURE_AI_CHAT === 'true',
  aiSearch: process.env.NEXT_PUBLIC_FEATURE_AI_SEARCH === 'true',
  aiProductQnA: process.env.NEXT_PUBLIC_FEATURE_AI_PRODUCT_QNA === 'true',
};
```

## Features

### 1. AI Shopping Assistant Chat

**Components:**
- **Backend:** `/api/ai/chat` - POST endpoint
- **Frontend:** `app/components/AIAssistantChat.js`

**Features:**
- Conversational interface for product discovery
- Context-aware responses based on cart contents
- User authentication awareness
- Floating chat widget with expand/collapse

**How to Enable:**
Set environment variable: `NEXT_PUBLIC_FEATURE_AI_CHAT=true`

**Integration:**
```jsx
import AIAssistantChat from './components/AIAssistantChat';
import { features } from './libs/config';

// In your component
{features.aiChat && <AIAssistantChat cartProductIds={cartIds} />}
```

### 2. AI-Augmented Search

**Components:**
- **Backend:** `/api/products/ai-search?q={query}` - GET endpoint
- **Frontend:** Updated `app/layouts/includes/MainHeader.js`

**Features:**
- AI expands search queries into semantic keywords
- Searches across product titles and descriptions
- Falls back to regular search if AI fails
- Maintains existing UI/UX

**How It Works:**
1. User enters search query
2. AI generates 3-7 related keywords/phrases
3. System searches for products matching any keyword
4. Returns up to 20 results

**How to Enable:**
Set environment variable: `NEXT_PUBLIC_FEATURE_AI_SEARCH=true`

### 3. AI Product Q&A

**Components:**
- **Backend:** `/api/ai/product-qna` - POST endpoint
- **Frontend:** `app/components/ProductQnA.js`

**Features:**
- Ask questions about specific products
- AI answers based only on product data (no hallucination)
- Expandable/collapsible UI
- Keyboard shortcuts (Enter to submit)

**How to Enable:**
Set environment variable: `NEXT_PUBLIC_FEATURE_AI_PRODUCT_QNA=true`

**Integration:**
```jsx
import ProductQnA from './components/ProductQnA';
import { features } from './libs/config';

// In product detail page
{features.aiProductQnA && <ProductQnA productId={product.id} />}
```

### 4. AI-Assisted Recommendations

**Components:**
- **Backend:** `/api/products/recommendations?productId={id}` - GET endpoint
- **Frontend:** Updated `app/components/SimilarProducts.js`

**Features:**
- AI selects best upsell/cross-sell products
- Context-aware based on current product
- Graceful fallback to random selection
- No UI changes required

**How It Works:**
1. Fetches 15 random candidate products
2. AI ranks them for relevance to current product
3. Returns top 5 recommendations
4. Falls back to random selection if AI fails

**Integration:**
```jsx
<SimilarProducts productId={product.id} />
```

## Configuration

### Environment Variables

Required variables in `.env` or `.env.local`:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://your-instance.openai.azure.com/
AZURE_OPENAI_KEY=your-api-key
AZURE_OPENAI_API_KEY=your-api-key  # Alternative name
AZURE_OPENAI_CHAT_DEPLOYMENT=gpt-5.1
AZURE_OPENAI_CHAT_API_VERSION=2025-01-01-preview

# Feature Flags
NEXT_PUBLIC_FEATURE_AI_CHAT=true
NEXT_PUBLIC_FEATURE_AI_SEARCH=true
NEXT_PUBLIC_FEATURE_AI_PRODUCT_QNA=true
```

### Azure Setup

1. **Create Azure OpenAI Resource**
   - Deploy a chat model (e.g., gpt-4, gpt-3.5-turbo)
   - Note the endpoint and API key

2. **Configure Environment Variables**
   - In development: Add to `.env.local`
   - In Azure Container Apps: Add to container environment configuration
   - In GitHub Actions: Add as secrets

3. **Deploy Configuration**
   - Ensure all secrets are set in deployment environment
   - Feature flags default to `false` if not set

## Error Handling

All AI features include comprehensive error handling:

- **Missing Configuration:** Logs warning but doesn't crash
- **API Errors:** Returns graceful error messages to users
- **Network Issues:** Falls back to non-AI alternatives where possible
- **Invalid Responses:** Catches JSON parsing errors

## Performance Considerations

- **Caching:** Consider implementing response caching for frequently asked questions
- **Timeouts:** Default timeout is 30 seconds for AI responses
- **Rate Limiting:** Monitor Azure OpenAI usage to avoid throttling
- **Cost Management:** Track token usage in Azure portal

## Security

- API keys are server-side only
- User data is not stored by AI
- Feature flags prevent accidental exposure of incomplete features
- All API routes validate input parameters

## Monitoring

Key metrics to monitor:
- AI API response times
- Error rates per endpoint
- Token usage and costs
- User engagement with AI features

Add logging in production:
```javascript
console.log('[AI Feature] Query:', query, 'User:', userId, 'Timestamp:', Date.now());
```

## Future Enhancements

Potential improvements:
1. Add vector embeddings for better semantic search
2. Implement conversation history persistence
3. Add user feedback collection for AI responses
4. Integrate Azure Search for advanced indexing
5. Add A/B testing for AI vs non-AI features
6. Implement response caching with Redis
7. Add multilingual support

## Troubleshooting

### AI Features Not Working

1. **Check Environment Variables:**
   ```bash
   echo $AZURE_OPENAI_ENDPOINT
   echo $NEXT_PUBLIC_FEATURE_AI_CHAT
   ```

2. **Check Browser Console:**
   - Look for API errors
   - Verify feature flag values

3. **Check Server Logs:**
   - Look for Azure OpenAI configuration warnings
   - Check for API authentication errors

### Build Failures

If you encounter PostCSS errors:
```javascript
// postcss.config.js should be:
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## Testing

### Manual Testing Checklist

- [ ] AI Chat widget appears on homepage when flag is enabled
- [ ] Search returns relevant results with AI search enabled
- [ ] Product Q&A accepts questions and returns answers
- [ ] Recommendations show related products on product pages
- [ ] Features gracefully disable when flags are false
- [ ] Error messages are user-friendly
- [ ] UI is responsive on mobile devices

### Example Test Queries

**AI Chat:**
- "Show me products under $50"
- "What's the best smartphone you have?"
- "Compare these products in my cart"

**AI Search:**
- "gaming laptop" (should expand to gaming, laptop, computer, etc.)
- "birthday gift" (should find gift-related items)

**Product Q&A:**
- "What are the dimensions?"
- "Is this compatible with...?"
- "What's included in the box?"

## License

This implementation is part of MagicCommerce and follows the same license.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Azure OpenAI documentation
3. Check application logs
4. Contact the development team
