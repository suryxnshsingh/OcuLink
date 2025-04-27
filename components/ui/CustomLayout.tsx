import React, { useMemo, useEffect, useState } from 'react';
import { 
  ParticipantView,
  useCallStateHooks,
  useCall,
  hasScreenShare
} from '@stream-io/video-react-sdk';
import { cn } from '@/lib/utils';

export const CustomLayout = () => {
  // Access call state
  const { useParticipants, useLocalParticipant, useHasOngoingScreenShare } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  
  // Use the built-in hook to detect if anyone is screen sharing
  const isScreenSharing = useHasOngoingScreenShare();
  
  // Track viewport size for responsive layout
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  );
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Find participants who are screen sharing
  const screenSharingParticipants = useMemo(() => {
    return participants.filter(p => hasScreenShare(p));
  }, [participants]);
  
  // Prepare all participants for display
  const sortedParticipants = useMemo(() => {
    if (!participants.length) return [];
    
    // Copy the participants array to avoid mutating it
    const sorted = [...participants];
    
    // If there's screen sharing, prioritize those participants
    if (isScreenSharing) {
      // Move screen sharing participants to the front
      return sorted.sort((a, b) => {
        const aIsSharing = hasScreenShare(a);
        const bIsSharing = hasScreenShare(b);
        
        if (aIsSharing && !bIsSharing) return -1;
        if (!aIsSharing && bIsSharing) return 1;
        return 0;
      });
    }
    
    return sorted;
  }, [participants, isScreenSharing]);

  // If no participants, show a message
  if (!sortedParticipants.length) {
    return <div className="flex h-full items-center justify-center pb-20 p-4">Waiting for participants...</div>;
  }

  // Determine layout based on screen sharing
  if (isScreenSharing && screenSharingParticipants.length > 0) {
    // Get the participant who is screen sharing
    const screenSharingParticipant = screenSharingParticipants[0];
    
    return (
      <div className="flex h-full w-full flex-col pb-20 p-4">
        {/* Screen share view */}
        <div className={cn(
          "w-full border-4 border-green-300 border-double",
          isMobile ? "h-[60%]" : "h-[75%]"
        )}>
          <div className="relative h-full w-full">
            <ParticipantView 
              participant={screenSharingParticipant} 
              trackType="screenShareTrack"
              className="h-full w-full"
            />
          </div>
        </div>
        
        {/* Other participants in a horizontal strip - centered */}
        <div className={cn(
          "w-full flex flex-row overflow-x-auto p-1 justify-center",
          isMobile ? "h-[40%]" : "h-[25%]"
        )}>
          {sortedParticipants.map((participant) => (
            <div 
              key={participant.sessionId}
              className={cn(
                "h-full p-1 flex-shrink-0",
                isMobile ? "min-w-[120px]" : "min-w-[160px]"
              )}
            >
              <div className="relative h-full w-full">
                <ParticipantView 
                  participant={participant}
                  trackType="videoTrack"
                  className="h-full w-full border-2 border-green-200"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Standard grid layout when not screen sharing
  return (
    <div className="flex h-full w-full pb-20 p-4">
      <div className="flex flex-grow w-full flex-wrap justify-center">
        {sortedParticipants.map((participant) => {
          // Calculate responsive grid sizing
          const sizeClasses = 
            sortedParticipants.length === 1 ? "w-full h-full" :
            sortedParticipants.length === 2 ? (isMobile ? "w-full h-1/2" : "w-1/2 h-full") :
            sortedParticipants.length <= 4 ? "w-1/2 h-1/2" :
            sortedParticipants.length <= 6 ? (isMobile ? "w-1/2 h-1/3" : "w-1/3 h-1/2") :
            isMobile ? "w-1/2 h-1/4" : "w-1/3 h-1/3";
            
          return (
            <div 
              key={participant.sessionId}
              className={cn("p-1", sizeClasses)}
            >
              <div className="relative h-full w-full">
                <ParticipantView 
                  participant={participant}
                  trackType="videoTrack"
                  className="h-full w-full border-4 border-double border-green-200"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomLayout;