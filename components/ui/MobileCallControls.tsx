import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  CallStatsButton,
  ToggleAudioPublishingButton, 
  ToggleVideoPublishingButton, 
  ReactionsButton,
  RecordCallButton,
  ScreenShareButton,
  CancelCallButton
} from '@stream-io/video-react-sdk';
import { Info, MessageCircle, Users, MoreVertical } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { SidebarTabType } from '@/types/meeting';

interface MobileCallControlsProps {
  toggleSidebar: (tab: SidebarTabType) => void;
  activeTab: SidebarTabType;
  onLeave?: () => void;
}

const MobileCallControls: React.FC<MobileCallControlsProps> = ({ 
  toggleSidebar, 
  activeTab,
  onLeave
}) => {
  return (
    <div className="flex items-center justify-center gap-3 p-4">

      {/* End call button */}
      <CancelCallButton onLeave={onLeave} />

      {/* Main controls that are always visible */}
      <ToggleVideoPublishingButton />
      <ToggleAudioPublishingButton />
      <ReactionsButton />
      
      {/* More options menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="bg-green-200 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] py-2 px-0.5">
            <div className="flex items-center justify-center">
              <MoreVertical size={20} />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 m-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-green-200">
          <DropdownMenuGroup>
            {/* Stream SDK controls */}
            <DropdownMenuItem onSelect={() => {}} className="p-2">
              <ScreenShareButton />
              <span className="ml-2">Share screen</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => {}} className="p-2">
              <RecordCallButton />
              <span className="ml-2">Record</span>
            </DropdownMenuItem>
            
            {/* Custom sidebar toggles */}
            <DropdownMenuItem 
              onSelect={() => toggleSidebar('participants')} 
              className={cn(
                "p-2",
                activeTab === 'participants' ? "bg-red-200 hover:bg-red-300" : ""
              )}
            >
              <div className="flex items-center justify-center h-10 w-10">
                <Users size={20} />
              </div>
              <span className="ml-2">Participants</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onSelect={() => toggleSidebar('chat')} 
              className={cn(
                "p-2",
                activeTab === 'chat' ? "bg-red-200 hover:bg-red-300" : ""
              )}
            >
              <div className="flex items-center justify-center h-10 w-10">
                <MessageCircle size={20} />
              </div>
              <span className="ml-2">Chat</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onSelect={() => toggleSidebar('info')} 
              className={cn(
                "p-2",
                activeTab === 'info' ? "bg-red-200 hover:bg-red-300" : ""
              )}
            >
              <div className="flex items-center justify-center h-10 w-10">
                <Info size={20} />
              </div>
              <span className="ml-2">Call info</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MobileCallControls;