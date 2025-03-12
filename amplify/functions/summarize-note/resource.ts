import { defineFunction, secret } from "@aws-amplify/backend";

export const defineSummarizeNote = defineFunction({
  name: "summarizeNote",
//   layers: {
//     "stripe": process.env.STRIPE_LAMBDA_LAYER_ARN || "arn:aws:lambda:eu-central-1:441556928030:layer:stripeJS:1"
//   },
  entry: './handler.ts',
  environment: {
    OPENAI_API_KEY: secret("OPENAI_API_KEY"),
  }
});