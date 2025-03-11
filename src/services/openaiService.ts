import { OpenAI } from "openai";

const OPENAI_API_KEY =
  "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";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const summarizeNote = async (content: string) => {
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
          content: `Summarize this note?\n${content}`,
        },
      ],
    });

    const res = response.choices[0].message.content;
    console.log("Res", res);
    return res;
  } catch (error) {
    console.error("Error summarizing note:", error);
    throw error;
  }
};

export default summarizeNote;
