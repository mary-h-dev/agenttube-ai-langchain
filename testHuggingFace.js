import { HuggingFaceHub } from "@langchain/community";




const llm = new HuggingFaceHub({
  repoId: "gpt2",
  modelKwargs: { temperature: 0.9, maxLength: 50 },
  huggingFaceHubApiKey: process.env.HUGGINGFACEHUB_API_KEY,
});

const response = await llm.invoke("سلام، چطوری؟");
console.log(response);







// import { HuggingFaceInference } from "langchain/llms/hf";

// async function testHuggingFace() {
//   const model = new HuggingFaceInference({
//     model: "gpt2",
//     apiKey: "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",
//     maxTokens: 100,
//     temperature: 0.7,
//   });

//   const text = "Hello from Hugging Face! Translate to French.";
//   const response = await model.call(text);
//   console.log("HF model response:", response);
// }

// testHuggingFace();
