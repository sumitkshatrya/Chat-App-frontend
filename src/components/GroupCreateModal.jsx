import { useState } from "react";
import { Users, X, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const GroupCreateModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const { users } = useChatStore();
  const { authUser } = useAuthStore();

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      toast.error("Please provide a group name and select at least one member");
      return;
    }

    setIsCreating(true);
    try {
      const res = await axiosInstance.post("/groups", {
        name: groupName.trim(),
        description: "",
        members: selectedMembers
      });

      if (res.data) {
        toast.success("Group created successfully!");
        onClose();
        setGroupName("");
        setSelectedMembers([]);
        // Refresh groups list
        useChatStore.getState().getGroups();
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(error.response?.data?.error || "Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  const toggleMemberSelection = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create New Group</h3>
          <button 
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            disabled={isCreating}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Group Name Input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Group Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              disabled={isCreating}
            />
          </div>
          
          {/* Members Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Select Members</span>
              <span className="label-text-alt">
                {selectedMembers.length} selected
              </span>
            </label>
            
            <div className="border rounded-lg p-2 max-h-48 overflow-y-auto">
              {users
                .filter(user => user._id !== authUser._id)
                .map(user => (
                  <label 
                    key={user._id} 
                    className="flex items-center gap-3 p-2 hover:bg-base-200 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user._id)}
                      onChange={() => toggleMemberSelection(user._id)}
                      className="checkbox checkbox-sm checkbox-primary"
                      disabled={isCreating}
                    />
                    
                    <div className="avatar">
                      <div className="size-8 rounded-full">
                        <img
                          src={user.profilePic || "/avatar.png"}
                          alt={user.fullName}
                          className="object-cover"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {user.fullName}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {user.email}
                      </div>
                    </div>
                  </label>
                ))}
              
              {users.filter(user => user._id !== authUser._id).length === 0 && (
                <div className="text-center text-zinc-500 py-4">
                  No other users available
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <button 
              onClick={onClose}
              className="btn btn-ghost flex-1"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button 
              onClick={handleCreateGroup}
              className="btn btn-primary flex-1"
              disabled={isCreating || !groupName.trim() || selectedMembers.length === 0}
            >
              {isCreating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Users className="size-4" />
                  Create Group
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupCreateModal;