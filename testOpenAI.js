
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

async function testOpenAI() {
  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
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


