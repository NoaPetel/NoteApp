import { defineFunction, secret } from "@aws-amplify/backend";

export const defineSummarizeNote = defineFunction({
  name: "summarizeNote",
  entry: './handler.ts',
  environment: {
    OPENAI_API_KEY: secret("OPENAI_API_KEY"),
  }
});