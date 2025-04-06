// "use client";
// import React, { useState } from "react";
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// interface GeminiResponse {
//   content: string;
// }

// function TestGeminiComponent() {
//   const [response, setResponse] = useState("");

//   const handleTest = async () => {
//     try {
//       const llm = new ChatGoogleGenerativeAI({
//         modelName: "gemini-pro",
//         apiKey: "AIzaSyA4FF4tb3Xljw4FnuZnpe3A-j2r0zR_56k",
//         temperature: 0.7,
//       });
//       const res = (await llm.invoke("سلام، چطوری؟")) as GeminiResponse;
//       setResponse(res.content);
//     } catch (error) {
//       console.error("خطا در تماس با Gemini:", error);
//       setResponse("خطایی رخ داده است.");
//     }
//   };

//   return (
//     <div>
//       <h1 className="text-7xl">Test</h1>
//       <button onClick={handleTest} className="p-10 bg-red-600">تست Gemini</button>
//       {response && <div className="text-blue-400">پاسخ: {response}</div>}
//     </div>
//   );
// }

// export default TestGeminiComponent;




"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";



interface GeminiResponse {
  content: string;
}

function TestGeminiComponent() {
  const [response, setResponse] = useState("");
  const [streamedResponse, setStreamedResponse] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);


  
  // اسکرول خودکار به آخر صفحه هنگام تغییر streamedResponse
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamedResponse]);



  const handleTest = async () => {
    try {
      // آرایه‌ای برای ذخیره توکن‌های دریافتی
      const tokens: string[] = [];

      // ایجاد نمونه LLM با حالت استریم فعال
      const llm = new ChatGoogleGenerativeAI({
        modelName: "gemini-pro",
        apiKey: "AIzaSyA4FF4tb3Xljw4FnuZnpe3A-j2r0zR_56k",
        temperature: 0.7,
        streaming: true,
        callbacks: [
          {
            // callback برای هر توکن دریافتی
            handleLLMNewToken(token: string) {
              console.log("توکن دریافت شد:", token);
              tokens.push(token);
              // به‌روزرسانی پاسخ استریم‌شده در هر دریافت
              setStreamedResponse(tokens.join(""));
            },
          },
        ],
      });

      // فراخوانی مدل (این متد به صورت async کار می‌کند)
      const res = (await llm.invoke("سلام، چطوری؟")) as GeminiResponse;
      // زمانی که پاسخ نهایی دریافت شد، آن را در state قرار می‌دهیم
      setResponse(res.content);
    } catch (error) {
      console.error("خطا در تماس با Gemini:", error);
      setResponse("خطایی رخ داده است.");
    }
  };

  return (
    <div>
      <h1 className="text-7xl">Test Streaming Gemini Directly</h1>
      <button onClick={handleTest} className="p-10 bg-red-600">
        تست Gemini با استریم
      </button>
      {streamedResponse && (
        <div className="text-blue-400">
          <h2>پاسخ استریم‌شده:</h2>
          <pre>{streamedResponse}</pre>
        </div>
      )}
      {response && (
        <div className="text-green-400">
          <h2>پاسخ نهایی:</h2>
          <pre>{response}</pre>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default TestGeminiComponent;

