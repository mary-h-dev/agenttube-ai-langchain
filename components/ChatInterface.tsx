"use client";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { ChatRequestBody, StreamMessageType } from "@/lib/types";
import { createSSEParser } from "@/lib/createSSEParser";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import MessageBubble from "./MessageBubble";
import WelcomeMessage from "./WelcomeMessage";
import { useAuth } from "@clerk/nextjs";


interface ChatInterfaceProps {
  chatId: Id<"chats">;
  initialMessages: Doc<"messages">[];
}

function ChatInterface({ chatId, initialMessages }: ChatInterfaceProps) {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Doc<"messages">[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [currentTool, setCurrentTool] = useState<{
    name: string;
    input: unknown;
  } | null>(null);

  // به انتهای ‍‍‍‍‍یام میره
  const messagesEndRef = useRef<HTMLDivElement>(null);

  //این میره به انتهای صفحه در صورت یکه ‍یام جدیدی برامون بیاد
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedResponse]);

  //  تبدیل داده به رشته
  const formatToolOutput = (output: unknown): string => {
    if (typeof output === "string") return output;
    return JSON.stringify(output, null, 2);
  };

  //خروجی ابزار را بخ یک قالبت HTML  زیبا و خوانا تبدیل می کنه
  const formatTerminalOutput = ({
    tool,
    input,
    output,
  }: {
    tool: string;
    input: unknown;
    output: unknown;
  }) => {
    const terminalHtml = `
      <div class="bg-[#1e1e1e] text-white font-mono p-2 rounded-md my-2 overflow-x-auto whitespace-normal max-w-[600px]">
        <div class="flex items-center gap-1.5 border-b border-gray-700 pb-1">
          <span class="text-red-500">~</span>
          <span class="text-yellow-500">$</span>
          <span class="text-green-500">></span>
          <span class="text-gray-400 ml-1 text-sm">(${tool})</span>
        </div>
  
        <div class="text-gray-400 mt-1.5">Input:</div>
        <pre class="text-yellow-400 mt-0.5 whitespace-pre-wrap overflow-x-auto">
          ${formatToolOutput(input)}
        </pre>
   
        <div class="text-gray-400 mt-1.5">Output:</div>
        <pre class="text-green-400 mt-0.5 whitespace-pre-wrap overflow-x-auto">
          ${formatToolOutput(output)}
        </pre>
      </div>
    `;

    return `---START---\n${terminalHtml}\n---END---`;
  };

  // این تابع با استفاده از یک reader داده ها را به صورت چانگ میخونه و به تابع دیگه می فرسته تا نمایش داده بشه
  const processStream = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onChunk: (chunk: string) => Promise<void>
  ) => {
    try {
      while (true) {
        // Read the next chunk from the stream
        const { done, value } = await reader.read();

        // If the stream is finished, exit the loop
        if (done) break;

        // Decode the chunk and pass it to the onChunk callback
        await onChunk(new TextDecoder().decode(value));
      }
    } finally {
      // Release the reader lock to free up resources
      reader.releaseLock();
    }
  };

  // ارسال فرم
  // ابدا داده های کاربر  trim  میشه
  // یعنی اگه جایی اضافی بود رو حذف می کنه

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Reset UI state for new message
    setInput("");
    setStreamedResponse("");
    setIsLoading(true);

    // تا اینجا ‍یام کاربر رفته حالا می خوایم خیلی خوب نمایش داده بشه
    // Add user's message immediately for better UX
    const optimisticUserMessage: Doc<"messages"> = {
      _id: `temp_${Date.now()}`,
      chatId,
      content: trimmedInput,
      role: "user",
      createdAt: Date.now(),
    } as Doc<"messages">;

    setMessages((prev) => [...prev, optimisticUserMessage]);

    let fullResponse = "";

    // اینجا ‍یام میره سمت سرور
    try {
      // Prepare request body
      const requestBody: ChatRequestBody = {
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        newMessage: trimmedInput,
        chatId,
        userId, // اینجا مقدار userId را می‌فرستیم
      };

      // Initialize SSE connection
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error(await response.text());
      if (!response.body) throw new Error("No response body available");

      // Handle response stream
      // ‍س از دریافت ‍اسخ از سرور با استفاده از  createSSEParser داده های دریافتی به ‍یام های sse  تقسیم میشوند
      const parser = createSSEParser();
      const reader = response.body.getReader();

      // Process the stream chunks
      await processStream(reader, async (chunk) => {
        // Parse SSE messages from the chunk
        const messages = parser.parse(chunk);

        for (const message of messages) {
          switch (message.type) {
            case StreamMessageType.Token:
              //برای دریافت تکه های متنی ‍اسخ
              // Handle streaming tokens (normal text response)
              if ("token" in message) {
                fullResponse += message.token;
                setStreamedResponse(fullResponse);
              }
              break;

            case StreamMessageType.ToolStart:
              // اینجا یک ابزار کارش رو انجام می ده و در ترمینا نمایش داده میشه
              // Handle start of tool execution (e.g. API calls, file operations)
              if ("tool" in message) {
                setCurrentTool({
                  name: message.tool,
                  input: message.input,
                });
                fullResponse += formatTerminalOutput({
                  tool: message.tool,
                  input: message.input,
                  output: "Processing...",
                });
                setStreamedResponse(fullResponse);
              }
              break;

            case StreamMessageType.ToolEnd:
              //‍ایان اجرای ابزار
              // Handle completion of tool execution
              if ("tool" in message && currentTool) {
                // Replace the "Processing..." message with actual output
                const lastTerminalIndex = fullResponse.lastIndexOf(
                  `<div class="bg-[#1e1e1e]"`
                );
                if (lastTerminalIndex !== -1) {
                  fullResponse =
                    fullResponse.substring(0, lastTerminalIndex) +
                    formatTerminalOutput({
                      tool: message.tool,
                      input: currentTool.input,
                      output: message.output,
                    });
                }
                setStreamedResponse(fullResponse);
                setCurrentTool(null);
              }
              break;

            case StreamMessageType.Error:
              // اگر خطا دریافت کردیم
              // Handle error messages from the stream
              if ("error" in message) {
                throw new Error(message.error);
              }
              break;

            case StreamMessageType.Done:
              // Handle completion of the entire response
              // در صورتی که انجام شد
              // ‍یام ها در دیتابیس ذخیره میشود
              const assistantMessage: Doc<"messages"> = {
                _id: `temp_assistant_${Date.now()}`,
                chatId,
                content: fullResponse,
                role: "assistant",
                createdAt: Date.now(),
              } as Doc<"messages">;

              // Save the complete message to the database
              const convex = getConvexClient();
              console.log("debug", fullResponse)
              await convex.mutation(api.messages.store, {
                chatId,
                content: fullResponse,
                role: "assistant",
              });

              setMessages((prev) => [...prev, assistantMessage]);
              setStreamedResponse("");
              return;
          }
        }
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the optimistic message if there was an error
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== optimisticUserMessage._id)
      );
      setStreamedResponse(
        formatTerminalOutput({
          tool: "error",
          input: "Failed to process message",
          output: error instanceof Error ? error.message : "Unknown error",
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-[calc(100vh-theme(spacing.14))]">
      {/* Messages */}
      <section className="flex-1 overflow-y-auto bg-gray-50 p-2 md:p-0">
        <div className="max-w-4xl mx-auto p-4 space-y-3">
          {messages?.length === 0 && <WelcomeMessage/>}
          {messages.map((message: Doc<"messages">) => (
            <MessageBubble
              key={message._id}
              content={message.content}
              isUser={message.role === "user"}
            />
          ))}
          {/* Streamed Response */}
          {streamedResponse && <MessageBubble content={streamedResponse} />}

          {/* Loading Indicator */}
          {isLoading && !streamedResponse && (
            <div className="flex justify-start animate-in fade-in-0">
              <div className="rounded-2xl px-4 py-3 bg-white text-gray-900 ring-1 ring-inset ring-gray-200 rounded-bl-none shadow-sm">
                <div className="flex items-center gap-1.5">
                  {[0.3, 0.15, 0].map((delay, i) => (
                    <div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Last Message Scroll Ref */}
          <div ref={messagesEndRef} />
        </div>
      </section>
      <footer className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message AI Agent..."
              className="flex-1 py-3 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 bg-gray-50 placeholder:text-gray-500"
              disabled={isLoading}
            />

            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`absolute right-1.5 rounded-xl h-9 w-9 p-0 flex items-center justify-center transition-all  ${
                input.trim()
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <ArrowRight className="text-white" />
            </Button>
          </div>
        </form>
      </footer>
    </main>
  );
}

export default ChatInterface;
