export function formatMessageTime(dateString) {
  if (!dateString) return "";
  
  const messageDate = new Date(dateString);
  if (isNaN(messageDate.getTime())) return "";
  
  const now = new Date();
  const diffInMilliseconds = now - messageDate;
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  
  if (diffInMinutes < 1) {
    return "Just now";
  }
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }
  
  if (diffInHours < 24) {
    return messageDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  
  if (diffInHours < 48) {
    return "Yesterday " + messageDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  
  return messageDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }) + " " + messageDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}