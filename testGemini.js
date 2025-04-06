import {ChatGoogleGenerativeAI} from "@langchain/google-genai"




const llm = new ChatGoogleGenerativeAI({
    modelName: "gemini-pro",
    apiKey: "AIzaSyA4FF4tb3Xljw4FnuZnpe3A-j2r0zR_56k",
    temperature: 0.7,
});

const response = await llm.invoke("سلام، چطوری؟");
console.log(response);
