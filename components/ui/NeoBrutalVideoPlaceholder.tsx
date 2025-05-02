import React, { useEffect, useState } from 'react';
import { useParticipantViewContext, type VideoPlaceholderProps, useCallStateHooks } from '@stream-io/video-react-sdk';
import { cn } from '@/lib/utils';

/**
 * Custom Video Placeholder component with neobrutalistic design
 * Uses participant's image as blurred background with centered image on top
 * Scales elements based on available space
 */
export const NeoBrutalVideoPlaceholder = ({ style }: VideoPlaceholderProps) => {
  const { participant } = useParticipantViewContext();
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  
  // Get container dimensions to adjust element sizes
  const [containerSize, setContainerSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false
  });
  
  // Determine size classes based on number of participants and screen size
  const [sizeClasses, setSizeClasses] = useState({
    imageSize: "w-24 h-24",
    fontSize: "text-4xl",
    nameSize: "text-sm",
    namePadding: "py-1 px-3",
    borderWidth: "border-3",
    shadowSize: "shadow-[3px_3px_0px_rgba(0,0,0,0.8)]"
  });
  
  useEffect(() => {
    const calculateSizes = () => {
      const isMobile = window.innerWidth < 768;
      const totalParticipants = participants.length;
      
      // Set size classes based on participant count and device
      if (isMobile) {
        if (totalParticipants >= 7) {
          return {
            imageSize: "w-16 h-16", // Increased from w-12 h-12
            fontSize: "text-2xl", // Increased from text-xl
            nameSize: "text-xs",
            namePadding: "py-0.5 px-1.5", // Slightly wider
            borderWidth: "border-2", // Increased from border
            shadowSize: "shadow-[2px_2px_0px_rgba(0,0,0,0.8)]" // Increased
          };
        } else if (totalParticipants >= 4) {
          return {
            imageSize: "w-20 h-20", // Increased from w-16 h-16
            fontSize: "text-3xl", // Increased from text-2xl
            nameSize: "text-sm", // Increased from text-xs
            namePadding: "py-0.5 px-2",
            borderWidth: "border-2",
            shadowSize: "shadow-[2px_2px_0px_rgba(0,0,0,0.8)]"
          };
        } else {
          return {
            imageSize: "w-24 h-24", // Kept same for 1-3 participants
            fontSize: "text-4xl",
            nameSize: "text-sm",
            namePadding: "py-1 px-3",
            borderWidth: "border-3",
            shadowSize: "shadow-[3px_3px_0px_rgba(0,0,0,0.8)]"
          };
        }
      } else {
        // Desktop sizes - slightly increased all
        if (totalParticipants >= 7) {
          return {
            imageSize: "w-20 h-20", // Increased from w-16 h-16
            fontSize: "text-3xl", // Increased from text-2xl
            nameSize: "text-xs",
            namePadding: "py-0.5 px-2",
            borderWidth: "border-2",
            shadowSize: "shadow-[2px_2px_0px_rgba(0,0,0,0.8)]"
          };
        } else if (totalParticipants >= 4) {
          return {
            imageSize: "w-24 h-24", // Increased from w-20 h-20
            fontSize: "text-3xl",
            nameSize: "text-sm",
            namePadding: "py-1 px-2",
            borderWidth: "border-2",
            shadowSize: "shadow-[3px_3px_0px_rgba(0,0,0,0.8)]"
          };
        } else {
          return {
            imageSize: "w-28 h-28", // Increased from w-24 h-24
            fontSize: "text-5xl", // Increased from text-4xl
            nameSize: "text-base", // Increased from text-sm
            namePadding: "py-1 px-3",
            borderWidth: "border-3",
            shadowSize: "shadow-[4px_4px_0px_rgba(0,0,0,0.8)]" // Stronger shadow
          };
        }
      }
    };
    
    const updateDimensions = () => {
      setContainerSize({
        width: window.innerWidth,
        isMobile: window.innerWidth < 768
      });
      setSizeClasses(calculateSizes());
    };
    
    // Initialize sizes
    setSizeClasses(calculateSizes());
    
    // Add event listener to update on resize
    window.addEventListener('resize', updateDimensions);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [participants.length]);
  
  return (
    <div 
      className={cn(
        "relative flex flex-col justify-center items-center w-full h-full overflow-hidden"
      )}
    >
      {/* Background image with blur effect */}
      {participant.image ? (
        <>
          {/* Blurred background image */}
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url(${participant.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(70px) brightness(0.8)',
            }}
          />
          
          {/* Overlay to soften the background */}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Centered foreground image */}
          <div className="relative z-5 flex flex-col items-center">
            <div className={cn(
              sizeClasses.imageSize, 
              sizeClasses.borderWidth, 
              sizeClasses.shadowSize,
              "overflow-hidden mb-2 md:mb-4"
            )}>
              <img 
                src={participant.image} 
                alt={participant.name || participant.userId} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className={cn(
              sizeClasses.nameSize,
              sizeClasses.namePadding,
              sizeClasses.borderWidth, 
              sizeClasses.shadowSize,
              "bg-green-200 font-bold text-black border-black transform -rotate-1"
            )}>
              {/* Truncate long names when space is limited but allow more characters */}
              {containerSize.isMobile && participants.length > 6 
                ? (participant.name || participant.userId).substring(0, 8) + (((participant.name || participant.userId).length > 8) ? '..' : '')
                : containerSize.isMobile && participants.length > 4 
                  ? (participant.name || participant.userId).substring(0, 10) + (((participant.name || participant.userId).length > 10) ? '..' : '')
                  : (participant.name || participant.userId)}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Colored background for users without images */}
          <div className="absolute inset-0 bg-[#FFED91]" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className={cn(
              sizeClasses.imageSize,
              sizeClasses.fontSize,
              sizeClasses.borderWidth, 
              sizeClasses.shadowSize,
              "flex items-center justify-center bg-[#FC5C7D] font-bold text-black border-black mb-2 md:mb-4"
            )}>
              {(participant.name?.[0] || participant.userId?.[0] || '?').toUpperCase()}
            </div>
            <div className={cn(
              sizeClasses.nameSize,
              sizeClasses.namePadding,
              sizeClasses.borderWidth, 
              sizeClasses.shadowSize,
              "bg-green-200 font-bold text-black border-black transform -rotate-1"
            )}>
              {/* Truncate long names when space is limited but allow more characters */}
              {containerSize.isMobile && participants.length > 6 
                ? (participant.name || participant.userId).substring(0, 8) + (((participant.name || participant.userId).length > 8) ? '..' : '')
                : containerSize.isMobile && participants.length > 4 
                  ? (participant.name || participant.userId).substring(0, 10) + (((participant.name || participant.userId).length > 10) ? '..' : '')
                  : (participant.name || participant.userId)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};