import { BotIcon } from "lucide-react";

function DashboardPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="relative max-w-xl w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-50/50 rounded-3xl"></div>
        <div className="absolute inset-2 bg-[linear-gradient(to_right,#5f5f5f15,transparent,transparent)] bg-[size:4rem_4rem] rounded-3xl"></div>

        <div className="relative space-y-6 p-8 text-center">
          <div className="shadow-sm ring-1 ring-gray-200/30 bg-white/60 backdrop-blur-sm rounded-xl p-6 space-y-4">
            <div className="bg-gradient-to-br from-gray-500 to-white rounded-xl inline-flex p-4">
              <BotIcon className="h-12 w-12 text-gray-900" />
            </div>
            <h2 className="text-2xl font-semibold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
              AI Agent Chat
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Start a new conversation or select an existing chat from the sidebar.
              Your AI assistant is ready to help with any task.
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              Real-time responses
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              Smart assistance
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              Powerful tools
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

