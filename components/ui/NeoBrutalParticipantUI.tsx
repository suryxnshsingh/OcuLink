import React, { useEffect, useState } from 'react';
import { useParticipantViewContext, SfuModels, useCallStateHooks } from '@stream-io/video-react-sdk';
import { cn } from '@/lib/utils';

/**
 * Minimal Participant UI component with neobrutalistic design
 * Scales down based on number of participants and screen size
 */
export const NeoBrutalParticipantUI = () => {
  const { participant } = useParticipantViewContext();
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  
  const isAudioMuted = !participant.audioStream;
  const isVideoMuted = !participant.videoStream;
  const isPoorConnection = participant.connectionQuality === SfuModels.ConnectionQuality.POOR;
  
  // Determine size classes based on number of participants and screen size
  const [sizeClasses, setSizeClasses] = useState({
    textSize: "text-sm",
    iconSize: "w-3.5 h-3.5",
    padding: "py-[2px] px-2",
    border: "border-2",
    itemSpacing: "mr-2",
    dividerHeight: "h-4",
    dividerSpacing: "mx-1",
    position: "bottom-2 left-2"
  });
  
  useEffect(() => {
    const calculateSizes = () => {
      const isMobile = window.innerWidth < 768;
      const totalParticipants = participants.length;
      
      // Set size classes based on participant count and device
      if (isMobile) {
        if (totalParticipants >= 7) {
          return {
            textSize: "text-xs", // Increased from text-[10px]
            iconSize: "w-3 h-3", // Increased from w-2.5 h-2.5
            padding: "py-[1px] px-1.5", // Increased padding
            border: "border-[1.5px]", // More prominent border
            itemSpacing: "mr-1",
            dividerHeight: "h-3",
            dividerSpacing: "mx-0.5",
            position: "bottom-1 left-1"
          };
        } else if (totalParticipants >= 4) {
          return {
            textSize: "text-xs",
            iconSize: "w-3.5 h-3.5", // Increased from w-3 h-3
            padding: "py-[1.5px] px-2", // Increased padding
            border: "border-[1.5px]",
            itemSpacing: "mr-1.5",
            dividerHeight: "h-3.5",
            dividerSpacing: "mx-0.5",
            position: "bottom-1 left-1"
          };
        } else {
          return {
            textSize: "text-sm",
            iconSize: "w-4 h-4", // Increased slightly
            padding: "py-[2px] px-2",
            border: "border-2",
            itemSpacing: "mr-2",
            dividerHeight: "h-4",
            dividerSpacing: "mx-1",
            position: "bottom-2 left-2"
          };
        }
      } else {
        // Desktop sizes - slightly increased all
        if (totalParticipants >= 7) {
          return {
            textSize: "text-xs",
            iconSize: "w-3.5 h-3.5", // Increased
            padding: "py-[1px] px-2", // Slightly wider
            border: "border-[1.5px]",
            itemSpacing: "mr-1.5",
            dividerHeight: "h-3.5",
            dividerSpacing: "mx-0.5",
            position: "bottom-1.5 left-1.5"
          };
        } else if (totalParticipants >= 4) {
          return {
            textSize: "text-sm",
            iconSize: "w-4 h-4",
            padding: "py-[2px] px-2",
            border: "border-2",
            itemSpacing: "mr-2",
            dividerHeight: "h-4",
            dividerSpacing: "mx-0.5",
            position: "bottom-2 left-2"
          };
        } else {
          return {
            textSize: "text-sm",
            iconSize: "w-4 h-4",
            padding: "py-[3px] px-3", // Slightly more padding for 1-3 participants
            border: "border-2",
            itemSpacing: "mr-2",
            dividerHeight: "h-4.5",
            dividerSpacing: "mx-1",
            position: "bottom-2 left-2"
          };
        }
      }
    };
    
    const updateSizes = () => {
      setSizeClasses(calculateSizes());
    };
    
    // Initialize sizes
    setSizeClasses(calculateSizes());
    
    // Add event listener to update on resize
    window.addEventListener('resize', updateSizes);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateSizes);
    };
  }, [participants.length]);
  
  return (
    // Single unified box with name and status icons
    <div className={`absolute ${sizeClasses.position} z-10`}>
      <div className={`flex items-center bg-[#82E6D5] ${sizeClasses.border} border-black shadow-[2px_2px_0px_rgba(0,0,0,0.8)] ${sizeClasses.padding}`}>
        {/* Name - truncate if needed */}
        <span className={`text-black ${sizeClasses.textSize} font-medium ${sizeClasses.itemSpacing}`}>
          {participants.length >= 5 && window.innerWidth < 768
            ? (participant.name || participant.userId).substring(0, 6) + ((participant.name || participant.userId).length > 6 ? '..' : '')
            : participants.length >= 4 && window.innerWidth < 768
              ? (participant.name || participant.userId).substring(0, 8) + ((participant.name || participant.userId).length > 8 ? '..' : '')
              : (participant.name || participant.userId)}
        </span>
        
        {/* Divider */}
        <div className={`${sizeClasses.dividerHeight} w-[1px] bg-black/30 ${sizeClasses.dividerSpacing}`}></div>
        
        {/* Video status icon */}
        <svg 
          className={`${sizeClasses.iconSize} ml-1 ${isVideoMuted ? 'text-[#FC5C7D]' : 'text-black'}`}
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          {isVideoMuted ? (
            <path d="M4 4h10v8H4V4zm12 3v2.5l4-1.5v7l-4-1.5V16H4v-2h12z" />
          ) : (
            <path d="M4 4h10v8H4V4zm12 2.5V8l4-1.5v7L16 12v1.5H4v-2h12z" />
          )}
        </svg>
        
        {/* Audio status icon */}
        <svg 
          className={`${sizeClasses.iconSize} ml-1.5 ${isAudioMuted ? 'text-[#FC5C7D]' : 'text-black'}`}
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          {isAudioMuted ? (
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
          ) : (
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          )}
        </svg>
        
        {/* Connection quality icon - only visible when poor */}
        {isPoorConnection && (
          <svg 
            className={`${sizeClasses.iconSize} ml-1.5 text-[#FC5C7D]`}
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 13h20v-3H2v3zm4-2.5c0-.83-.67-1.5-1.5-1.5S1 10.67 1 11.5 1.67 13 2.5 13 4 12.33 4 11.5zM2 6h20V3H2v3zm4-2.5c0-.83-.67-1.5-1.5-1.5S1 2.67 1 3.5 1.67 5 2.5 5 4 4.33 4 3.5z" />
          </svg>
        )}
      </div>
    </div>
  );
};