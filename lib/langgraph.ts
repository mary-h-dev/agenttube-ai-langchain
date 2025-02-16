import { ChatAnthropic } from "@langchain/anthropic";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import wxflows from "@wxflows/sdk/langchain";

import {
  END,
  MemorySaver,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import SYSTEM_MESSAGE from "@/constants/systemMessage";

import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  trimMessages,
} from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

//costomers at : https://introspection.apis.stepzen.com/customers
//Comments at : https://dummyjson.com/comments

// مدیریت پیام‌ها برای حفظ تاریخچه مکالمه
const trimmer = trimMessages({
  maxTokens: 10, // حداکثر تعداد توکن‌های پیام
  strategy: "last", // استراتژی انتخاب پیام‌های اخیر
  tokenCounter: (msgs) => msgs.length, // شمارش توکن‌ها از تعداد پیام‌ها
  includeSystem: true, // پیام‌های سیستمی را نیز در نظر بگیر
  allowPartial: false, // اجازه پیام‌های ناقص داده نشود
  startOn: "human", // مکالمه از پیام‌های انسانی شروع شود
});

// ✅ اتصال به wxflows
const toolClient = new wxflows({
  endpoint: process.env.WXFLOWS_ENDPOINT || "",
  apikey: process.env.WXFLOWS_APIKEY || "",
});

// ✅ دریافت ابزارها (Retrieve the tools)
const tools = await toolClient.lcTools;
const toolNode = new ToolNode(tools);

export const initialiseModel = () => {
  const model = new ChatAnthropic({
    modelName: "Claude-3-5-sonnet-20241022",
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    temperature: 0.7,
    maxTokens: 4096,
    streaming: true,
    clientOptions: {
      defaultHeaders: {
        "anthropic-beta": "prompt-caching-2024-07-31",
      },
    },
    callbacks: [
      {
        handleLLMStart: async () => {
          console.log("🚀 Starting LLM call");
        },
        handleLLMEnd: async (output) => {
          console.log("✅ End LLM Call", output);
          const usage = output.llmOutput?.usage;
          if (usage) {
            // console.log("📊 Token Usage:", {
            //   input_tokens: usage.input_tokens,
            //   output_tokens: usage.output_tokens,
            //   total_tokens: usage.input_tokens + usage.output_tokens,
            //   cache_creation_input_tokens:
            //     usage.cache_creation_input_tokens || 0,
            //   cache_read_input_tokens: usage.cache_read_input_tokens || 0,
            // });
          }
        },
        // handleLLMNewToken: async (token: string) => {
        //   console.log("🆕 New token:", token);
        // },
      },
    ],
  }).bindTools(tools);

  return model;
};

// تعریف تابعی که بررسی می‌کند ادامه داده شود یا نه
function shouldContinue(state: typeof MessagesAnnotation.State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;

  // اگر LLM یک ابزار را صدا زده باشد، به نود "tools" می‌رویم
  if (lastMessage.tool_calls?.length) {
    return "tools";
  }

  // اگر آخرین پیام یک پیام ابزار باشد، به agent برمی‌گردیم
  if (lastMessage.content && lastMessage.getType() === "tool") {
    return "agent";
  }

  // در غیر این صورت، مکالمه را متوقف می‌کنیم و به کاربر پاسخ می‌دهیم
  return END;
}


const createWorkflow = () => {
  const model = initialiseModel();

  const stateGraph = new StateGraph(MessagesAnnotation)
    .addNode("agent", async (state) => {
      // Create the system message content
      const systemContent = SYSTEM_MESSAGE;

      // Create the prompt template with system message and messages placeholder
      const promptTemplate = ChatPromptTemplate.fromMessages([
        new SystemMessage(systemContent, {
          cache_control: { type: "ephemeral" }, // Set a cache breakpoint
        }),
        new MessagesPlaceholder("messages"),
      ]);

      // Trim the messages to manage conversation history
      const trimmedMessages = await trimmer.invoke(state.messages);

      //format the prompt with the correct messages
      const prompt = await promptTemplate.invoke({ messages: trimMessages });
      //get response from the model
      const response = await model.invoke(prompt);

      return { messages: [response] };
    })
    .addEdge(START, "agent")
    .addNode("tools", toolNode)
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  return stateGraph;
};



function addCachingHeaders(messages: BaseMessage[]): BaseMessage[] {
  // قوانین کش برای مدیریت پیام‌ها در مکالمات چرخشی
  // 1. کش کردن اولین پیام SYSTEM
  // 2. کش کردن آخرین پیام
  // 3. کش کردن پیام انسانی ماقبل آخر

  if (!messages.length) return messages;

  // ایجاد یک کپی از پیام‌ها برای جلوگیری از تغییر مستقیم آرایه اصلی
  const cachedMessages = [...messages];

  // تابع کمکی برای افزودن کنترل کش
  const addCache = (message: BaseMessage) => {
    message.content = [
      {
        type: "text",
        text: message.content as string,
        cache_control: { type: "ephemeral" },
      },
    ];
  };

  // کش کردن آخرین پیام
  addCache(cachedMessages.at(-1)!);

  // یافتن و کش کردن پیام انسانی ماقبل آخر
  let humanCount = 0;
  for (let i = cachedMessages.length - 1; i >= 0; i--) {
    if (cachedMessages[i] instanceof HumanMessage) {
      humanCount++;
      if (humanCount === 2) {
        addCache(cachedMessages[i]);
        break;
      }
    }
  }

  return cachedMessages;
}




export async function submitQuestion(messages: BaseMessage[], chatId: string) {
  const cachedMessages = addCachingHeaders(messages);
  console.log("Messages", cachedMessages);

  const workflow = createWorkflow();

  // Create a checkpoint to save the state of the conversation
  const checkpointer = new MemorySaver();
  const app = workflow.compile({ checkpointer });

  // Run the graph and stream
  const stream = await app.streamEvents(
    {
      messages: cachedMessages,
    },
    {
      version: "v2",
      configurable: {
        thread_id: chatId,
      },
      streamMode: "messages",
      runId: chatId,
    }
  );
  return stream;
}
