import { cn } from '@/lib/utils';
import { SidebarTabType } from '@/types/meeting';
import { Call as StreamCall } from '@stream-io/video-react-sdk';
import { Info, MessageCircle, Users, X } from 'lucide-react';
import React from 'react';
import { DrawerClose } from './drawer';
import { NeoBrutalParticipantsList } from './NeoBrutalParticipantsList';
import MeetingChat from './MeetingChat';
import MeetingInfo from './MeetingInfo';

interface MeetingSidebarProps {
  activeTab: SidebarTabType;
  toggleSidebar: (tab: SidebarTabType) => void;
  isMobile: boolean;
  sidebarVisible: boolean;
  setActiveTab: React.Dispatch<React.SetStateAction<SidebarTabType>>;
  setSidebarVisible: React.Dispatch<React.SetStateAction<boolean>>;
  call: StreamCall | null;
  drawerOpen?: boolean;
  setDrawerOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const MeetingSidebar = ({
  activeTab,
  toggleSidebar,
  isMobile,
  sidebarVisible,
  setActiveTab,
  setSidebarVisible,
  call,
  drawerOpen,
  setDrawerOpen,
}: MeetingSidebarProps) => {

  // Tab navigation component - shared between drawer & sidebar
  const TabNavigation = () => (
    <div className="flex border-b-2 border-black">
      {/* Tab buttons */}
      <button 
        onClick={() => toggleSidebar('participants')}
        className={cn(
          'flex-1 py-3 font-medium border-r-2 border-black flex items-center justify-center gap-2',
          activeTab === 'participants' 
            ? 'bg-green-300' 
            : 'bg-green-100 hover:bg-green-200'
        )}
      >
        <Users size={18} />
        People
      </button>
      <button 
        onClick={() => toggleSidebar('chat')}
        className={cn(
          'flex-1 py-3 font-medium border-r-2 border-black flex items-center justify-center gap-2',
          activeTab === 'chat' 
            ? 'bg-green-300' 
            : 'bg-green-100 hover:bg-green-200'
        )}
      >
        <MessageCircle size={18} />
        Chat
      </button>
      <button 
        onClick={() => toggleSidebar('info')}
        className={cn(
          'flex-1 py-3 font-medium border-r-2 border-black flex items-center justify-center gap-2',
          activeTab === 'info' 
            ? 'bg-green-300' 
            : 'bg-green-100 hover:bg-green-200'
        )}
      >
        <Info size={18} />
        Info
      </button>
      {isMobile ? (
        <DrawerClose className="p-3 bg-red-200 hover:bg-red-300 border-l-2 border-black">
          <X size={18} />
        </DrawerClose>
      ) : (
        <button 
          onClick={() => {
            setActiveTab(null);
            setSidebarVisible(false);
          }}
          className="p-3 bg-red-200 hover:bg-red-300"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );

  // Mobile tab navigation component for pill-style tabs
  const MobileTabNavigation = () => (
    <div className="flex justify-center items-center p-3 my-2">
      {/* Outer pill container */}
      <div className="flex w-full max-w-[95%] bg-green-100 rounded-full p-1.5 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
        {/* Individual tab buttons */}
        <button 
          onClick={() => toggleSidebar('participants')}
          className={cn(
            'flex-1 py-2 text-center text-sm font-medium transition-all duration-200',
            activeTab === 'participants' 
              ? 'bg-green-300 rounded-full shadow-sm border border-black' 
              : 'text-black'
          )}
        >
          People
        </button>
        <button 
          onClick={() => toggleSidebar('chat')}
          className={cn(
            'flex-1 py-2 text-center text-sm font-medium transition-all duration-200 mx-1',
            activeTab === 'chat' 
              ? 'bg-green-300 rounded-full shadow-sm border border-black' 
              : 'text-black'
          )}
        >
          Chat
        </button>
        <button 
          onClick={() => toggleSidebar('info')}
          className={cn(
            'flex-1 py-2 text-center text-sm font-medium transition-all duration-200',
            activeTab === 'info' 
              ? 'bg-green-300 rounded-full shadow-sm border border-black' 
              : 'text-black'
          )}
        >
          Info
        </button>
      </div>
    </div>
  );

  // Tab content component - shared between drawer & sidebar
  const TabContent = () => (
    <div className="flex-1 overflow-hidden">
      {activeTab === 'participants' && (
        <div className="h-full">
          <NeoBrutalParticipantsList onClose={() => toggleSidebar('participants')} />
        </div>
      )}
      
      {activeTab === 'chat' && call && (
        <div className="h-full">
          <MeetingChat 
            meetingId={call.id} 
            isOpen={true} 
            isSidebar={true}
          />
        </div>
      )}
      
      {activeTab === 'info' && call && (
        <div className="h-full">
          <MeetingInfo 
            meetingId={call.id}
            isSidebar={true}
          />
        </div>
      )}
    </div>
  );

  // Render appropriate sidebar based on device type
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <MobileTabNavigation />
        <TabContent />
      </div>
    );
  }
  
  return sidebarVisible ? (
    <div className={cn(
      'h-full bg-green-200 border-l-2 border-black',
      'animate-in slide-in-from-right duration-300',
      'w-[30%]',
      'z-[60]'
    )}>
      <div className="flex flex-col h-full">
        <TabNavigation />
        <TabContent />
      </div>
    </div>
  ) : null;
};

export default MeetingSidebar;