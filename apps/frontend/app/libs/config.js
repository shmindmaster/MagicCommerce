// app/libs/config.js
export const features = {
  aiChat: process.env.NEXT_PUBLIC_FEATURE_AI_CHAT === 'true',
  aiSearch: process.env.NEXT_PUBLIC_FEATURE_AI_SEARCH === 'true',
  aiProductQnA: process.env.NEXT_PUBLIC_FEATURE_AI_PRODUCT_QNA === 'true',
  vectorSearch: process.env.NEXT_PUBLIC_FEATURE_VECTOR_SEARCH === 'true',
  enhancedRecommendations: process.env.NEXT_PUBLIC_FEATURE_ENHANCED_RECOMMENDATIONS === 'true',
  visualSearch: process.env.NEXT_PUBLIC_FEATURE_VISUAL_SEARCH === 'true',
};
