import {ChatGoogleGenerativeAI} from "@langchain/google-genai"




const llm = new ChatGoogleGenerativeAI({
    modelName: "gemini-pro",
    apiKey: process.env.TEST_GEMENI_API_KEY,
    temperature: 0.7,
});

const response = await llm.invoke("سلام، چطوری؟");
console.log(response);
