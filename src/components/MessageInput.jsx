import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = ({ isGroup = false }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const { 
    sendMessage, 
    sendGroupMessage, 
    selectedUser, 
    selectedGroup,
    sendTypingIndicator, 
    stopTypingIndicator,
    sendGroupTypingIndicator,  
    stopGroupTypingIndicator  
  } = useChatStore();

  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Cleanup typing on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (selectedUser && !isGroup) {
        stopTypingIndicator(selectedUser._id);
      }
      if (selectedGroup && isGroup) {
        stopGroupTypingIndicator(selectedGroup._id);
      }
    };
  }, [selectedUser, selectedGroup, isGroup, stopTypingIndicator, stopGroupTypingIndicator]);

  const handleInputChange = (e) => {
    setText(e.target.value);

    if (!isTyping) {
      setIsTyping(true);

      if (isGroup && selectedGroup) {
        sendGroupTypingIndicator(selectedGroup._id);
      } else if (selectedUser) {
        sendTypingIndicator(selectedUser._id);
      }
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (isGroup && selectedGroup) {
        stopGroupTypingIndicator(selectedGroup._id);
      } else if (selectedUser) {
        stopTypingIndicator(selectedUser._id);
      }
    }, 1000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      if (isGroup && selectedGroup) {
        await sendGroupMessage({
          text: text.trim(),
          image: imagePreview,
        });
      } else if (selectedUser) {
        await sendMessage({
          text: text.trim(),
          image: imagePreview,
        });
      }

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setIsTyping(false);
      if (isGroup && selectedGroup) {
        stopGroupTypingIndicator(selectedGroup._id);
      } else if (selectedUser) {
        stopTypingIndicator(selectedUser._id);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={handleInputChange}
            disabled={!selectedUser && !selectedGroup}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
            disabled={!selectedUser && !selectedGroup}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
            disabled={!selectedUser && !selectedGroup}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={(!text.trim() && !imagePreview) || (!selectedUser && !selectedGroup)}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
