import type { Schema } from "../../data/resource";
import { OpenAI } from "openai";

export const handler: Schema["summarizeNote"]["functionHandler"] = async (
  event
) => {
  const start = performance.now();


  const OPENAI_API_KEY =
    "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";

  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that summarizes the note given by the user and adapt the summary to his language. ",
        },
        {
          role: "user",
          content: `Summarize this note?\n${event.arguments.content}`,
        },
      ],
    });
    console.log("Response", response);
    const res = response.choices[0].message.content;
    console.log("Res", res);
    return {
      content: res,
      executionDuration: performance.now() - start,
    };
  } catch (error) {
    console.error("Error summarizing note:", error);
    throw error;
  }
};
