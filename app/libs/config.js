// app/libs/config.js
export const features = {
  aiChat: process.env.NEXT_PUBLIC_FEATURE_AI_CHAT === 'true',
  aiSearch: process.env.NEXT_PUBLIC_FEATURE_AI_SEARCH === 'true',
  aiProductQnA: process.env.NEXT_PUBLIC_FEATURE_AI_PRODUCT_QNA === 'true',
};
