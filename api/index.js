import { createApp, createGeminiGenerator } from "../server.js";

const app = createApp({ generate: createGeminiGenerator() });

export default app;
