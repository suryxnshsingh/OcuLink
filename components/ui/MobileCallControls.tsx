import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  CallStatsButton,
  ToggleAudioPublishingButton, 
  ToggleVideoPublishingButton, 
  ReactionsButton,
  CancelCallButton,
  LoadingIndicator,
  useCall,
  useCallStateHooks
} from '@stream-io/video-react-sdk';
import { Info, MessageCircle, Users, MoreVertical, MonitorUp, Video } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { SidebarTabType } from '@/types/meeting';
import { useToast } from '@/hooks/use-toast';

interface MobileCallControlsProps {
  toggleSidebar: (tab: SidebarTabType) => void;
  activeTab: SidebarTabType;
  onLeave?: () => void;
}

// Mobile custom screen share button component
const MobileCustomScreenShareButton = () => {
  const { useScreenShareState, useHasOngoingScreenShare } = useCallStateHooks();
  const { screenShare, isMute: isScreenShareMuted } = useScreenShareState();
  const isSomeoneScreenSharing = useHasOngoingScreenShare();
  
  // isScreenShareMuted being true means screen sharing is OFF
  // isScreenShareMuted being false means screen sharing is ON
  const isScreenSharing = !isScreenShareMuted;
  
  return (
    <div 
      onClick={() => screenShare.toggle()}
      className={cn(
        'flex items-center w-full cursor-pointer',
        (!isScreenSharing && isSomeoneScreenSharing) && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-center justify-center h-10 w-10">
        <MonitorUp size={20} />
      </div>
      <span className="ml-2">
        {isScreenSharing ? 'Stop sharing' : 'Share screen'}
      </span>
    </div>
  );
};

// Mobile custom record call button component
const MobileCustomRecordCallButton = () => {
  const call = useCall();
  const { useIsCallRecordingInProgress } = useCallStateHooks();
  const isCallRecordingInProgress = useIsCallRecordingInProgress();
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setIsAwaitingResponse((isAwaiting) => {
      if (isAwaiting) return false;
      return isAwaiting;
    });
  }, [isCallRecordingInProgress]);
  
  const toggleRecording = useCallback(async () => {
    try {
      setIsAwaitingResponse(true);
      if (isCallRecordingInProgress) {
        await call?.stopRecording();
        toast({
          title: "Recording stopped",
          description: "Your meeting recording has been stopped"
        });
      } else {
        await call?.startRecording();
        toast({
          title: "Recording started",
          description: "Your meeting is now being recorded"
        });
      }
    } catch (e) {
      console.error(`Failed to ${isCallRecordingInProgress ? 'stop' : 'start'} recording`, e);
      toast({
        title: `Failed to ${isCallRecordingInProgress ? 'stop' : 'start'} recording`,
        description: "Please try again",
        variant: "destructive"
      });
      setIsAwaitingResponse(false);
    }
  }, [call, isCallRecordingInProgress, toast]);
  
  if (isAwaitingResponse) {
    return (
      <div className='flex items-center w-full'>
        <div className="flex items-center justify-center h-10 w-10">
          <LoadingIndicator />
        </div>
        <span className="ml-2">
          {isCallRecordingInProgress ? "Stopping..." : "Starting..."}
        </span>
      </div>
    );
  }
  
  return (
    <div 
      onClick={toggleRecording}
      className={cn(
        'flex items-center w-full cursor-pointer',
        !call && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-center justify-center h-10 w-10 relative">
        <Video size={20} />
        {isCallRecordingInProgress && (
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </div>
      <span className="ml-2">
        {isCallRecordingInProgress ? 'Stop recording' : 'Record'}
      </span>
    </div>
  );
};

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
            {/* Custom screen share and recording buttons */}
            <DropdownMenuItem onSelect={() => {}} className="p-2">
              <MobileCustomScreenShareButton />
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => {}} className="p-2">
              <MobileCustomRecordCallButton />
            </DropdownMenuItem>
            
            {/* Custom sidebar toggles */}
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

          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MobileCallControls;