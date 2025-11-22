// app/libs/azureOpenAI.js
// JS shim that re-exports the TypeScript implementation so existing JS routes continue to work.
export { chatCompletion, getEmbeddings } from "./azureOpenAI";
