import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  // =========================
  //  State
  // =========================
  messages: [],
  users: [],
  groups: [],
  groupMessages: [],
  typingUsers: [],
  groupTypingUsers: [],
  selectedUser: null,
  selectedGroup: null,
  isTyping: false,
  isUsersLoading: false,
  isGroupsLoading: false,
  isMessagesLoading: false,
  isGroupMessagesLoading: false,

  // =========================
  //  Users
  // =========================
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // =========================
  //  Groups
  // =========================
  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error("Failed to load groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  refreshGroups: async () => {
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      console.error("Failed to refresh groups:", error);
    }
  },

  // =========================
  //  One-to-One Chat
  // =========================
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId === selectedUser._id) {
        set({ messages: [...get().messages, newMessage] });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  // =========================
  //  Group Chat
  // =========================
  getGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ groupMessages: res.data });
    } catch (error) {
      toast.error("Failed to load group messages");
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  sendGroupMessage: async (messageData) => {
    const { selectedGroup, groupMessages } = get();
    try {
      const res = await axiosInstance.post(
        `/groups/${selectedGroup._id}/messages`,
        messageData
      );
      set({ groupMessages: [...groupMessages, res.data] });
    } catch (error) {
      toast.error("Failed to send group message");
    }
  },

  subscribeToGroupMessages: () => {
    const { selectedGroup } = get();
    if (!selectedGroup) return;
    const socket = useAuthStore.getState().socket;

    socket.emit("join-group", selectedGroup._id);

    socket.on(`group:${selectedGroup._id}:newMessage`, (newMessage) => {
      set({ groupMessages: [...get().groupMessages, newMessage] });
    });
  },

  unsubscribeFromGroupMessages: () => {
    const { selectedGroup } = get();
    if (!selectedGroup) return;
    const socket = useAuthStore.getState().socket;

    socket.emit("leave-group", selectedGroup._id);
    socket.off(`group:${selectedGroup._id}:newMessage`);
  },

  // =========================
  //  Typing Indicators (One-to-One)
  // =========================
  sendTypingIndicator: (receiverId) => {
    const socket = useAuthStore.getState().socket;
    if (socket && receiverId) socket.emit("typing-start", { receiverId });
  },

  stopTypingIndicator: (receiverId) => {
    const socket = useAuthStore.getState().socket;
    if (socket && receiverId) socket.emit("typing-stop", { receiverId });
  },

  subscribeToTyping: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    const addTypingUser = (userId) => {
      if (!get().typingUsers.includes(userId)) {
        const updated = [...get().typingUsers, userId];
        set({ typingUsers: updated, isTyping: updated.length > 0 });
      }
    };

    const removeTypingUser = (userId) => {
      const updated = get().typingUsers.filter((id) => id !== userId);
      set({ typingUsers: updated, isTyping: updated.length > 0 });
    };

    socket.on("user-typing", (data) => addTypingUser(data.userId));
    socket.on("user-stop-typing", (data) => removeTypingUser(data.userId));

    return () => {
      socket.off("user-typing");
      socket.off("user-stop-typing");
    };
  },

  // =========================
  //  Group Typing Indicators
  // =========================
  sendGroupTypingIndicator: (groupId) => {
    const socket = useAuthStore.getState().socket;
    if (socket && groupId) {
      socket.emit("group-typing-start", { groupId });
    }
  },

  stopGroupTypingIndicator: (groupId) => {
    const socket = useAuthStore.getState().socket;
    if (socket && groupId) {
      socket.emit("group-typing-stop", { groupId });
    }
  },

  subscribeToGroupTyping: () => {
    const { selectedGroup } = get();
    if (!selectedGroup) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    const addGroupTypingUser = (data) => {
      if (data.groupId === selectedGroup._id) {
        set((state) => ({
          groupTypingUsers: [...state.groupTypingUsers, data.userId],
        }));
      }
    };

    const removeGroupTypingUser = (data) => {
      if (data.groupId === selectedGroup._id) {
        set((state) => ({
          groupTypingUsers: state.groupTypingUsers.filter(
            (id) => id !== data.userId
          ),
        }));
      }
    };

    socket.on("group-user-typing", addGroupTypingUser);
    socket.on("group-user-stop-typing", removeGroupTypingUser);

    return () => {
      socket.off("group-user-typing", addGroupTypingUser);
      socket.off("group-user-stop-typing", removeGroupTypingUser);
    };
  },

  // =========================
  //  Chat Selection
  // =========================
  setSelectedUser: (selectedUser) => set({ selectedUser, selectedGroup: null }),
  setSelectedGroup: (selectedGroup) => set({ selectedGroup, selectedUser: null }),
}));
