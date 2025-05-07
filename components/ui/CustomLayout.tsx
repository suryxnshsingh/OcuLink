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
  
  // Track container dimensions for extra small layouts
  const [containerDimensions, setContainerDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setContainerDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
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
      
      // Get the screen sharing participant and additional participants depending on device
      const screenShareParticipant = sorted.find(p => hasScreenShare(p));
      
      // Limit to max 3 additional participants on mobile, 5 on desktop
      const maxAdditionalParticipants = isMobile ? 3 : 5;
      const otherParticipants = sorted.filter(p => !hasScreenShare(p)).slice(0, maxAdditionalParticipants);
      
      return screenShareParticipant 
        ? [screenShareParticipant, ...otherParticipants]
        : otherParticipants;
    }
    
    // For standard view, limit based on device
    // Mobile: max 6 participants
    // Desktop: max 9 participants
    const displayLimit = isMobile ? 6 : 9;
    return sorted.slice(0, displayLimit);
  }, [participants, isScreenSharing, isMobile]);

  // Get the count of additional participants not being shown
  const additionalParticipantsCount = participants.length - sortedParticipants.length;

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
    
    // Get other participants (non-screen sharing)
    // Limit based on screen size to avoid overcrowding
    const maxOtherParticipants = isMobile ? 3 : 5;
    
    const otherParticipants = sortedParticipants
      .filter(p => p.sessionId !== screenSharingParticipant.sessionId && !hasScreenShare(p))
      .slice(0, maxOtherParticipants);
    
    // Additional participants count for screen sharing mode
    const screenShareAdditionalCount = participants.length - (otherParticipants.length + 1);
    
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
              "h-full p-1 flex-shrink-0 relative",
              isMobile ? "min-w-[130px] max-w-[150px]" : 
                containerDimensions.width < 1000 ? "min-w-[140px] max-w-[170px]" : 
                "min-w-[180px] max-w-[200px]"
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
                "h-full p-1 flex-shrink-0 relative",
                isMobile ? "min-w-[130px] max-w-[150px]" : 
                  containerDimensions.width < 1000 ? "min-w-[140px] max-w-[170px]" : 
                  "min-w-[180px] max-w-[200px]"
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
        
        {/* Counter overlay showing how many more participants are not being displayed */}
        {screenShareAdditionalCount > 0 && (
          <div className="absolute bottom-28 right-6 transform translate-y-[-50%] bg-[#FFED91] px-3 py-1.5 border-3 border-black font-bold shadow-[3px_3px_0px_rgba(0,0,0,0.8)] rotate-3 z-10">
            +{screenShareAdditionalCount} more
          </div>
        )}
      </div>
    );
  }

  // Standard grid layout when not screen sharing
  return (
    <div className="flex h-full w-full pb-20 p-4">
      <div className="flex flex-grow w-full flex-wrap justify-center relative">
        {/* Show actual video participants */}
        {sortedParticipants.map((participant) => {
          // Calculate responsive grid sizing based on number of participants and screen size
          const sizeClasses = calculateGridSizeClasses(
            sortedParticipants.length, 
            isMobile, 
            containerDimensions
          );
            
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
        
        {/* Counter overlay showing additional participants */}
        {additionalParticipantsCount > 0 && (
          <div className="absolute bottom-5 right-5 bg-[#FFED91] px-4 py-2 border-3 border-black font-bold shadow-[3px_3px_0px_rgba(0,0,0,0.8)] rotate-3 z-10">
            +{additionalParticipantsCount} more participants
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to calculate grid size classes based on participant count and screen size
// Define interfaces for better type safety
interface Dimensions {
  width: number;
  height: number;
}

interface GridSizeClassesParams {
  participantCount: number;
  isMobile: boolean;
  dimensions: Dimensions;
}

// Helper function to calculate grid size classes based on participant count and screen size
const calculateGridSizeClasses = (
  participantCount: number, 
  isMobile: boolean, 
  dimensions: Dimensions
): string => {
  const { width, height } = dimensions;
  
  // Extra small screens
  if (width < 500 || height < 500) {
    if (participantCount === 1) return "w-full h-full";
    if (participantCount === 2) return "w-full h-1/2";
    if (participantCount <= 4) return "w-1/2 h-1/2";
    if (participantCount <= 6) return "w-1/2 h-1/3";
    // Mobile should never exceed 6 participants
    return "w-1/3 h-1/3"; // For desktop 7-9 participants
  }
  
  // Mobile screens
  if (isMobile) {
    if (participantCount === 1) return "w-full h-full";
    if (participantCount === 2) return "w-full h-1/2";
    if (participantCount <= 4) return "w-1/2 h-1/2";
    // Mobile only shows up to 6 participants in a 2x3 grid
    return "w-1/2 h-1/3"; 
  }
  
  // Smaller desktop screens
  if (width < 1200) {
    if (participantCount === 1) return "w-full h-full";
    if (participantCount === 2) return "w-1/2 h-full";
    if (participantCount <= 4) return "w-1/2 h-1/2";
    if (participantCount <= 6) return "w-1/3 h-1/2";
    return "w-1/3 h-1/3"; // For 7-9 participants
  }
  
  // Large desktop screens
  if (participantCount === 1) return "w-full h-full";
  if (participantCount === 2) return "w-1/2 h-full";
  if (participantCount <= 4) return "w-1/2 h-1/2";
  if (participantCount <= 6) return "w-1/3 h-1/2";
  return "w-1/3 h-1/3"; // For 7-9 participants
};

export default CustomLayout;