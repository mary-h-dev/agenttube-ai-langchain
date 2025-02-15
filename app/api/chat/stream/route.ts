import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";
import {
  ChatRequestBody,
  SSE_DATA_PREFIX,
  SSE_LINE_DELIMITER,
  StreamMessage,
  StreamMessageType,
} from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
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
      const { userId } = await auth();
      if (!userId) {
        return new Response("Unauthorized", { status: 401 });
      }
  
      const body = (await req.json()) as ChatRequestBody;
      const { messages, newMessage, chatId } = body;
  
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
  
          writer.close();
        } catch (error) {
          console.error("Error in chat API:", error);
          return NextResponse.json(
            { error: "Failed to process chat request" },
            { status: 500 }
          );
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
  