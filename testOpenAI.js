
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

async function testOpenAI() {
  const model = new ChatOpenAI({
    openAIApiKey: "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",
    modelName: "gpt-3.5-turbo", // یا "gpt-4" اگر دسترسی دارید
    // موقتاً streaming را غیرفعال کنید
    streaming: false,
    temperature: 0.7,
  });

  // مستقیماً و بدون هیچ ابزار و تریم پیام:
  const response = await model.invoke([
    new HumanMessage("Hello, how are you?")
  ]);

  console.log("Response: ", response);
}

testOpenAI();


