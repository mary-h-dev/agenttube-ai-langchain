import { Doc, Id } from "@/convex/_generated/dataModel";
import { NavigationContext } from "@/lib/NavigationProvider";
import { useRouter } from "next/navigation";
import { useContext } from "react";
// import TimeAgo from "react-timeago";

interface ChatRowProps {
  chat: Doc<"chats">;
  onDelete: (id: Id<"chats">) => void;
}

function ChatRow({ chat, onDelete }: ChatRowProps) {
  const router = useRouter();
  const { closeMobileNav } = useContext(NavigationContext);

  const handleClick = () => {
    router.push(`/dashboard/chat/${chat._id}`);
    closeMobileNav();
  };

  return (
    <div
      className="group rounded-xl border border-gray-200/30 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="font-medium">{chat.title}</div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(chat._id);
            }}
            className="text-red-500 hover:text-red-700"
          >
            🗑
          </button>
        </div>

        {/* {chat.lastMessage && (
          <div className="text-xs text-gray-400 mt-1.5 font-medium">
            <TimeAgo date={chat.lastMessage.createdAt} />
          </div>
        )} */}
      </div>
    </div>
  );
}

export default ChatRow;
