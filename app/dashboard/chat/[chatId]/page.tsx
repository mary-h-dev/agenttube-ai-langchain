import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatInterface from "@/components/ChatInterface";


interface ChatPageProps {
  params: Promise<{
    chatId: Id<"chats">;
  }>;
}

async function ChatPage({ params }: ChatPageProps) {
  const { chatId } = await params;

  const { userId } = await auth();
  console.log("userid", userId);

    // if (!userId) {
    //   redirect("/");
    // }

  try {

    const convex = getConvexClient();

    const initialMessages = await convex.query(api.messages.list, { chatId });

    return (
      <div className="flex-1 overflow-hidden">
        <ChatInterface chatId={chatId} initialMessages={initialMessages} />
      </div>
    );
  } catch (error) {
    console.error("Error loading chat:", error);
    redirect("/dashboard");
  }

}


export default ChatPage

