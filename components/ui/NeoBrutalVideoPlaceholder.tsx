import React, { useEffect, useState, useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get container dimensions to adjust element sizes
  const [containerSize, setContainerSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false
  });
  
  // Determine size classes based on number of participants and screen size
  const [sizeClasses, setSizeClasses] = useState({
    imageSize: "w-24 h-24",
    fontSize: "text-4xl",
    nameSize: "text-sm",
    namePadding: "py-1 px-3",
    borderWidth: "border-3",
    shadowSize: "shadow-[3px_3px_0px_rgba(0,0,0,0.8)]",
    showName: true
  });
  
  useEffect(() => {
    const calculateSizes = () => {
      const isMobile = window.innerWidth < 768;
      const totalParticipants = participants.length;
      const containerWidth = containerRef.current?.clientWidth || 0;
      const containerHeight = containerRef.current?.clientHeight || 0;
      
      // Extremely small container (like in a very crowded grid)
      const isVerySmall = containerWidth < 120 || containerHeight < 120;
      const isTiny = containerWidth < 80 || containerHeight < 80;
      
      // Set size classes based on participant count, device, and container dimensions
      if (isTiny) {
        // Extremely tiny size for very crowded layouts
        return {
          imageSize: "w-8 h-8",
          fontSize: "text-sm",
          nameSize: "text-[8px]",
          namePadding: "py-0.25 px-1",
          borderWidth: "border",
          shadowSize: "shadow-[1px_1px_0px_rgba(0,0,0,0.8)]",
          showName: false // Hide name in extremely tiny containers
        };
      } else if (isVerySmall) {
        // Very small size for crowded layouts
        return {
          imageSize: "w-12 h-12",
          fontSize: "text-xl",
          nameSize: "text-[10px]",
          namePadding: "py-0.25 px-1",
          borderWidth: "border",
          shadowSize: "shadow-[1px_1px_0px_rgba(0,0,0,0.8)]",
          showName: containerHeight > 100 // Only show name if there's enough height
        };
      } else if (isMobile) {
        if (totalParticipants >= 7) {
          return {
            imageSize: "w-16 h-16",
            fontSize: "text-2xl",
            nameSize: "text-xs",
            namePadding: "py-0.5 px-1.5",
            borderWidth: "border-2",
            shadowSize: "shadow-[2px_2px_0px_rgba(0,0,0,0.8)]",
            showName: true
          };
        } else if (totalParticipants >= 4) {
          return {
            imageSize: "w-20 h-20",
            fontSize: "text-3xl",
            nameSize: "text-sm",
            namePadding: "py-0.5 px-2",
            borderWidth: "border-2",
            shadowSize: "shadow-[2px_2px_0px_rgba(0,0,0,0.8)]",
            showName: true
          };
        } else {
          return {
            imageSize: "w-24 h-24",
            fontSize: "text-4xl",
            nameSize: "text-sm",
            namePadding: "py-1 px-3",
            borderWidth: "border-3",
            shadowSize: "shadow-[3px_3px_0px_rgba(0,0,0,0.8)]",
            showName: true
          };
        }
      } else {
        // Desktop sizes - slightly increased all
        if (totalParticipants >= 7) {
          return {
            imageSize: "w-20 h-20",
            fontSize: "text-3xl",
            nameSize: "text-xs",
            namePadding: "py-0.5 px-2",
            borderWidth: "border-2",
            shadowSize: "shadow-[2px_2px_0px_rgba(0,0,0,0.8)]",
            showName: true
          };
        } else if (totalParticipants >= 4) {
          return {
            imageSize: "w-24 h-24",
            fontSize: "text-3xl",
            nameSize: "text-sm",
            namePadding: "py-1 px-2",
            borderWidth: "border-2",
            shadowSize: "shadow-[3px_3px_0px_rgba(0,0,0,0.8)]",
            showName: true
          };
        } else {
          return {
            imageSize: "w-28 h-28",
            fontSize: "text-5xl",
            nameSize: "text-base",
            namePadding: "py-1 px-3",
            borderWidth: "border-3",
            shadowSize: "shadow-[4px_4px_0px_rgba(0,0,0,0.8)]",
            showName: true
          };
        }
      }
    };
    
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerSize({
          width: window.innerWidth,
          height: window.innerHeight,
          isMobile: window.innerWidth < 768
        });
        setSizeClasses(calculateSizes());
      }
    };
    
    // Initialize sizes
    setSizeClasses(calculateSizes());
    
    // Add event listener to update on resize
    window.addEventListener('resize', updateDimensions);
    
    // Create a ResizeObserver to monitor container size changes
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    
    // Observe container size changes
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
    };
  }, [participants.length]);
  
  return (
    <div 
      ref={containerRef}
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
              "overflow-hidden mb-1 md:mb-2"
            )}>
              <img 
                src={participant.image} 
                alt={participant.name || participant.userId} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Only render the name if showName is true */}
            {sizeClasses.showName && (
              <div className={cn(
                sizeClasses.nameSize,
                sizeClasses.namePadding,
                sizeClasses.borderWidth, 
                sizeClasses.shadowSize,
                "bg-green-200 font-bold text-black border-black transform -rotate-1"
              )}>
                {containerSize.isMobile && participants.length > 6 
                  ? (participant.name || participant.userId).substring(0, 6) + (((participant.name || participant.userId).length > 6) ? '..' : '')
                  : containerSize.isMobile && participants.length > 4 
                    ? (participant.name || participant.userId).substring(0, 8) + (((participant.name || participant.userId).length > 8) ? '..' : '')
                    : (participant.name || participant.userId).substring(0, 15) + (((participant.name || participant.userId).length > 15) ? '..' : '')}
              </div>
            )}
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
              "flex items-center justify-center bg-[#FC5C7D] font-bold text-black border-black mb-1 md:mb-2"
            )}>
              {(participant.name?.[0] || participant.userId?.[0] || '?').toUpperCase()}
            </div>
            
            {/* Only render the name if showName is true */}
            {sizeClasses.showName && (
              <div className={cn(
                sizeClasses.nameSize,
                sizeClasses.namePadding,
                sizeClasses.borderWidth, 
                sizeClasses.shadowSize,
                "bg-green-200 font-bold text-black border-black transform -rotate-1"
              )}>
                {containerSize.isMobile && participants.length > 6 
                  ? (participant.name || participant.userId).substring(0, 6) + (((participant.name || participant.userId).length > 6) ? '..' : '')
                  : containerSize.isMobile && participants.length > 4 
                    ? (participant.name || participant.userId).substring(0, 8) + (((participant.name || participant.userId).length > 8) ? '..' : '')
                    : (participant.name || participant.userId).substring(0, 15) + (((participant.name || participant.userId).length > 15) ? '..' : '')}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};