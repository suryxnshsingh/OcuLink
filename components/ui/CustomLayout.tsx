import React, { useMemo, useEffect, useState } from 'react';
import { 
  ParticipantView,
  useCallStateHooks,
  useCall,
  hasScreenShare
} from '@stream-io/video-react-sdk';
import { cn } from '@/lib/utils';
import { NeoBrutalVideoPlaceholder } from './NeoBrutalVideoPlaceholder';

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
  
  // Prepare all participants for display with limits
  const sortedParticipants = useMemo(() => {
    if (!participants.length) return [];
    
    // Copy the participants array to avoid mutating it
    const sorted = [...participants];
    
    // If there's screen sharing, prioritize those participants
    if (isScreenSharing) {
      // Move screen sharing participants to the front
      sorted.sort((a, b) => {
        const aIsSharing = hasScreenShare(a);
        const bIsSharing = hasScreenShare(b);
        
        if (aIsSharing && !bIsSharing) return -1;
        if (!aIsSharing && bIsSharing) return 1;
        return 0;
      });
      
      // Get the screen sharing participant and up to 3 more participants (total of 4)
      const screenShareParticipant = sorted.find(p => hasScreenShare(p));
      const otherParticipants = sorted.filter(p => !hasScreenShare(p)).slice(0, 3);
      
      return screenShareParticipant 
        ? [screenShareParticipant, ...otherParticipants]
        : otherParticipants;
    }
    
    // Limit to max 9 participants when no screen sharing
    return sorted.slice(0, 8);
  }, [participants, isScreenSharing]);

  // If no participants, show a message
  if (!sortedParticipants.length) {
    return (
      <div className="flex h-full items-center justify-center pb-20 p-4">
        <div className="bg-[#FFED91] p-6 border-4 border-black transform rotate-1">
          <span className="text-2xl font-bold">Waiting for participants...</span>
        </div>
      </div>
    );
  }

  // Determine layout based on screen sharing
  if (isScreenSharing && screenSharingParticipants.length > 0) {
    // Get the participant who is screen sharing
    const screenSharingParticipant = screenSharingParticipants[0];
    
    // Get other participants (non-screen sharing), limited to 3 to make room for the screen sharer's video
    // This allows for 4 total videos in the bottom row
    const otherParticipants = sortedParticipants
      .filter(p => p.sessionId !== screenSharingParticipant.sessionId && !hasScreenShare(p))
      .slice(0, 3);
    
    return (
      <div className="flex h-full w-full flex-col pb-20 p-4">
        {/* Screen share view */}
        <div className={cn(
          "w-full border-4 border-black bg-[#82E6D5]",
          isMobile ? "h-[60%]" : "h-[70%]"
        )}>
          <div className="relative h-full w-full">
            <ParticipantView 
              participant={screenSharingParticipant} 
              trackType="screenShareTrack"
              className="h-full w-full"
              VideoPlaceholder={NeoBrutalVideoPlaceholder}
            />
          </div>
        </div>
        
        {/* Participants strip including screen sharer's video */}
        <div className={cn(
          "w-full flex flex-row overflow-x-auto p-1 justify-center mt-4",
          isMobile ? "h-[40%]" : "h-[25%]"
        )}>
          {/* Include the screen sharing participant's video */}
          <div 
            className={cn(
              "h-full p-1 flex-shrink-0",
              isMobile ? "min-w-[130px] max-w-[150px]" : "min-w-[180px] max-w-[200px]"
            )}
          >
            <div className="relative h-full w-full">
              <ParticipantView 
                participant={screenSharingParticipant}
                trackType="videoTrack"
                className="h-full w-full border-3 border-black"
                VideoPlaceholder={NeoBrutalVideoPlaceholder}
              />
            </div>
          </div>

          {/* Other participants */}
          {otherParticipants.map((participant) => (
            <div 
              key={participant.sessionId}
              className={cn(
                "h-full p-1 flex-shrink-0",
                isMobile ? "min-w-[130px] max-w-[150px]" : "min-w-[180px] max-w-[200px]"
              )}
            >
              <div className="relative h-full w-full">
                <ParticipantView 
                  participant={participant}
                  trackType="videoTrack"
                  className="h-full w-full border-3 border-black"
                  VideoPlaceholder={NeoBrutalVideoPlaceholder}
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Counter showing how many more participants are not being displayed */}
        {participants.length > 4 && (
          <div className="w-full flex justify-center mt-2">
            <div className="bg-[#FFED91] px-4 py-1 border-2 border-black font-bold">
              +{participants.length - 4} more participants
            </div>
          </div>
        )}
      </div>
    );
  }

  // Standard grid layout when not screen sharing, limited to 9 participants
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
            sortedParticipants.length <= 9 ? (isMobile ? "w-1/2 h-1/3" : "w-1/3 h-1/3") : "";
            
          return (
            <div 
              key={participant.sessionId}
              className={cn("p-1", sizeClasses)}
            >
              <div className="relative h-full w-full">
                <ParticipantView 
                  participant={participant}
                  trackType="videoTrack"
                  className="h-full w-full border-4 border-black"
                  VideoPlaceholder={NeoBrutalVideoPlaceholder}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Counter showing how many more participants are not being displayed */}
      {participants.length > 9 && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2">
          <div className="bg-[#FFED91] px-4 py-1 border-2 border-black font-bold">
            +{participants.length - 9} more participants
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomLayout;