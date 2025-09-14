import { X, Users } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const GroupChatHeader = () => {
    const { selectedGroup, setSelectedGroup } = useChatStore();

    return (
        <div className="p-2.5 border-b border-base-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="avatar">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium">{selectedGroup.name}</h3>
                        <p className="text-sm text-base-content/70">
                            {selectedGroup.members.length} members
                        </p>
                    </div>
                </div>

                <button onClick={() => setSelectedGroup(null)}>
                    <X />
                </button>
            </div>
        </div>
    );
};

export default GroupChatHeader;