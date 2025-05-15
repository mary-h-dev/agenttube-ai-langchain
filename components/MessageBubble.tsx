"use client";
import { useUser } from "@clerk/nextjs";
import { BotIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";




interface MessageBubbleProps {
  content: string;
  isUser?: boolean;
}


const formatMessage = ({ content }: { content: string }) => {

  content = content.replace(/\\\\/g, "\\");
  content = content.replace(/\n/g, "\n");
  content = content.replace(/\n?---END/g, "");
  return content.trim();
};



function MessageBubble({ content, isUser }: MessageBubbleProps) {
  const { user } = useUser();



  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={
          "rounded-2xl px-4 py-2.5 max-w-[85%] md:max-w-[75%] shadow-sm ring-1 ring-inset relative " +
          (isUser
            ? "bg-blue-600 text-white rounded-br-none ring-blue-700"
            : "bg-white text-gray-900 rounded-bl-none ring-gray-200")
        }
      >
        <div className="absolute bottom-0 -right-10">
          <div
            className={
              "w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-sm " +
              (isUser ? "bg-white border-gray-100" : "bg-blue-600 border-white")
            }
          >
            {isUser ? (
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <BotIcon className="h-5 w-5 text-white" />
            )}
          </div>
        </div>

        <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
          <div
            dangerouslySetInnerHTML={{
              __html: formatMessage({ content }),
            }}
          />
        </div>
      </div>
    </div>
  );
}


export default MessageBubble;
