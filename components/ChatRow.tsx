import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { NavigationContext } from "@/lib/NavigationProvider";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import TimeAgo from "react-timeago";

interface ChatRowProps {
  chat: Doc<"chats">;
  onDelete: (id: Id<"chats">) => void;
}


function ChatRow({ chat, onDelete }: ChatRowProps) {
  const router = useRouter();
  const { closeMobileNav } = useContext(NavigationContext);


  const LastMessage = useQuery(api.messages.getLastMessage, {
    chatId: chat._id,
  });

  
  const handleClick = () => {
    router.push(`/deep-research/chat/${chat._id}`);
    closeMobileNav();
  };



 const getLocalDateString = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};



  return (
    <div
      className="group rounded-xl border border-gray-200/30 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <p className="text-sm text-gray-600 truncate flex-1 font-medium">
            {LastMessage ? (
              <>
                {LastMessage.role === "user" ? "you: " : "AI: "}
                {LastMessage.content.replace(/\\n/g, "\n")}
              </>
            ) : (
              <span className="text-gray-400">New conversation</span>
            )}
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(chat._id);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            🗑
          </button>
        </div>

        {LastMessage && (
          <div className="text-xs text-gray-400 mt-1.5 font-medium">
            <TimeAgo date={getLocalDateString(LastMessage.createdAt)} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatRow;
