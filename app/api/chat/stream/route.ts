import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import { submitQuestion } from "@/lib/langgraph";
import {
  ChatRequestBody,
  SSE_DATA_PREFIX,
  SSE_LINE_DELIMITER,
  StreamMessage,
  StreamMessageType,
} from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { NextResponse } from "next/server";

function sendSSEMessage(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  data: StreamMessage
) {
  const encoder = new TextEncoder();
  return writer.write(
    encoder.encode(
      `${SSE_DATA_PREFIX}${JSON.stringify(data)}${SSE_LINE_DELIMITER}`
    )
  );
}

export async function POST(req: Request) {
  try {
    // const { userId } = await auth();
    // if (!userId) {
    //   return new Response("Unauthorized", { status: 401 });
    // }

    const body = (await req.json()) as ChatRequestBody;
    const { messages, newMessage, chatId, userId } = body;

    // اگر به صورت جدی نیاز دارید احراز هویت کنید، باید userId معتبر باشد
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // اینجا می‌توانید از userId برای کاری که نیاز دارید استفاده کنید
    // مثلا نوشتن لاگ:
    console.log("userId received from client:", userId);

    const convex = getConvexClient();

    // ایجاد استریم با استراتژی صف بزرگ‌تر برای عملکرد بهتر
    const stream = new TransformStream({}, { highWaterMark: 1024 });
    const writer = stream.writable.getWriter();

    const response = new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // غیرفعال کردن بافر برای Nginx که برای SSE ضروری است
      },
    });

    const startStream = async () => {
      try {
        // پیام اولیه برای اتصال استریم
        await sendSSEMessage(writer, { type: StreamMessageType.Connected });

        // ارسال پیام جدید کاربر به Convex
        await convex.mutation(api.messages.send, {
          chatId,
          content: newMessage,
        });
        // تبدیل پیام‌ها به فرمت LangChain
        const langChainMessages = [
          ...messages.map((msg) =>
            msg.role === "user"
              ? new HumanMessage(msg.content)
              : new AIMessage(msg.content)
          ),
          new HumanMessage(newMessage),
        ];
        try {
          // ایجاد جریان رویداد
          const eventStream = await submitQuestion(langChainMessages, chatId);

          // پردازش داده‌های دریافتی از جریان رویداد
          for await (const event of eventStream) {
            if (event.event === "on_chat_model_stream") {
              const token = event.data.chunk;
              if (token) {
                const text = token.content.at(0)?.["text"];
                if (text) {
                  await sendSSEMessage(writer, {
                    type: StreamMessageType.Token,
                    token: text,
                  });
                }
              }
            } else if (event.event === "on_tool_start") {
              await sendSSEMessage(writer, {
                type: StreamMessageType.ToolStart,
                tool: event.name || "unknown",
                input: event.data.input,
              });
            } else if (event.event === "on_tool_end") {
              const toolMessage = new ToolMessage(event.data.output);
              await sendSSEMessage(writer, {
                type: StreamMessageType.ToolEnd,
                tool: toolMessage.lc_kwargs.name || "unknown",
                output: event.data.output,
              });
            }
          }

          // ارسال پیام تکمیل پردازش
          await sendSSEMessage(writer, { type: StreamMessageType.Done });
        } catch (streamError) {
          console.error("Error in event stream:", streamError);

          await sendSSEMessage(writer, {
            type: StreamMessageType.Error,
            error:
              streamError instanceof Error
                ? streamError.message
                : "Stream processing failed",
          });
        }
      } catch (error) {
        console.error("Error in stream:", error);
        await sendSSEMessage(writer, {
          type: StreamMessageType.Error,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        try {
          await writer.close();
        } catch (closeError) {
          console.error("Error closing writer:", closeError);
        }
      }
    };

    startStream();
    return response;
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
