import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import GroupChatHeader from "./GroupChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { Users } from "lucide-react";

const GroupChatContainer = () => {
  const {
    groupMessages,
    getGroupMessages,
    isGroupMessagesLoading,
    selectedGroup,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
    groupTypingUsers,
    subscribeToGroupTyping,
    users, // used for typing indicator display
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Fetch + subscribe to group messages
  useEffect(() => {
    if (selectedGroup?._id) {
      getGroupMessages(selectedGroup._id);
      subscribeToGroupMessages();
      const unsubscribeTyping = subscribeToGroupTyping();

      return () => {
        unsubscribeFromGroupMessages();
        unsubscribeTyping();
      };
    }
  }, [selectedGroup?._id]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messageEndRef.current && groupMessages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages]);

  if (isGroupMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <GroupChatHeader />
        <MessageSkeleton />
        <MessageInput isGroup={true} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <GroupChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Render messages */}
        {groupMessages?.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId._id === authUser?._id ? "chat-end" : "chat-start"
            }`}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={message.senderId.profilePic || "/avatar.png"}
                  alt={message.senderId.fullName}
                />
              </div>
            </div>

            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>

            <div className="chat-footer mt-1 opacity-50 text-xs">
              <div>{message.senderId.fullName}</div>
              <time>{formatMessageTime(message.createdAt)}</time>
            </div>
          </div>
        ))}

        {/* Group Typing Indicator */}
        {groupTypingUsers.length > 0 && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="size-4" />
              </div>
            </div>
            <div className="chat-bubble bg-transparent p-0">
              <div className="flex space-x-1 items-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
                <span className="text-sm text-gray-400 ml-2">
                  {groupTypingUsers.length}{" "}
                  {groupTypingUsers.length === 1
                    ? "person is"
                    : "people are"}{" "}
                  typing...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messageEndRef}></div>
      </div>

      <MessageInput isGroup={true} />
    </div>
  );
};

export default GroupChatContainer;
