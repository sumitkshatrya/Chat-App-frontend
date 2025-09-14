import { Users, Plus } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useState } from "react";
import GroupCreateModal from "./GroupCreateModal";

const GroupSidebar = () => {
  const { groups, isGroupsLoading, setSelectedGroup } = useChatStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (isGroupsLoading) {
    return (
      <div className="p-4">
        <div className="skeleton h-6 w-32 mb-4"></div>
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2 mb-2">
            <div className="skeleton size-8 rounded-full"></div>
            <div className="skeleton h-4 w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-base-300 pb-4 mb-4">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Users className="size-5" />
            <span className="font-medium">Groups</span>
          </div>
          
          {/* Create Group Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-sm btn-circle btn-primary"
            title="Create new group"
          >
            <Plus className="size-4" />
          </button>
        </div>
        
        <div className="space-y-1">
          {groups.map((group) => (
            <button
              key={group._id}
              onClick={() => setSelectedGroup(group)}
              className="w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors"
            >
              <div className="avatar">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="size-4" />
                </div>
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{group.name}</div>
                <div className="text-xs text-zinc-400">
                  {group.members.length} members
                </div>
              </div>
            </button>
          ))}
          
          {groups.length === 0 && (
            <div className="text-center text-zinc-500 py-4 text-sm">
              No groups yet
            </div>
          )}
        </div>
      </div>

      {/* Group Creation Modal */}
      <GroupCreateModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </>
  );
};

export default GroupSidebar;