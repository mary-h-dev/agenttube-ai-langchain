import { v } from "convex/values";
import { query } from "./_generated/server";
import { mutation } from "./_generated/server";

const SHOW_COMMENTS = false;

export const list = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .collect();

    // if (SHOW_COMMENTS) {
    //   console.log("📩 Retrieved messages:", {
    //     chatId: args.chatId,
    //     count: messages.length,
    //   });
    // }

    return messages;
  },
});

export const send = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: args.content.replace(/\n/g, "\\n"),
      role: "user",
      createdAt: Date.now(),
    });

    // if (SHOW_COMMENTS) {
    //   console.log("✅ پیام ذخیره شد:", {
    //     messageId,
    //     chatId: args.chatId,
    //     content: args.content,
    //   });
    // }

    return messageId;
  },
});

export const store = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      content: args.content.replace(/\n/g, "\\n"),
      role: args.role,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

export const getLastMessage = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const LastMessage = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .first();

    return LastMessage;
  },
});
