import type { Schema } from "../../data/resource";
import { OpenAI } from "openai";

export const handler: Schema["summarizeNote"]["functionHandler"] = async (
  event
) => {
  const start = performance.now();

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log("API", process.env.OPENAI_API_KEY);
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
