"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useCall, useCallStateHooks, StreamVideoEvent } from '@stream-io/video-react-sdk';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Copy, Link, Calendar, Users, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MeetingInfoProps {
  meetingId: string;
  isSidebar?: boolean;
}

const MeetingInfo = ({ meetingId, isSidebar = false }: MeetingInfoProps) => {
  const { toast } = useToast();
  const call = useCall();
  const { useLocalParticipant, useRemoteParticipants, useCallCallingState } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const callingState = useCallCallingState();
  const [participantCount, setParticipantCount] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  // Set initial participant count
  useEffect(() => {
    // Count all participants (local + remote)
    const allParticipantsCount = (localParticipant ? 1 : 0) + remoteParticipants.length;
    setParticipantCount(allParticipantsCount);
  }, [localParticipant, remoteParticipants]);

  // Subscribe to call events for real-time updates
  useEffect(() => {
    if (!call) return;
    
    // Function to handle participant joined event
    const handleParticipantJoined = (event: StreamVideoEvent) => {
      if (event.type === 'call.session_participant_joined') {
        setParticipantCount(prevCount => prevCount + 1);
        
        // If this is the first participant, record session start time
        if (!sessionStartTime) {
          setSessionStartTime(new Date());
        }
      }
    };
    
    // Function to handle participant left event
    const handleParticipantLeft = (event: StreamVideoEvent) => {
      if (event.type === 'call.session_participant_left') {
        setParticipantCount(prevCount => Math.max(0, prevCount - 1));
      }
    };
    
    // Function to handle session started event
    const handleSessionStarted = (event: StreamVideoEvent) => {
      if (event.type === 'call.session_started') {
        setSessionStartTime(new Date());
      }
    };
    
    // Subscribe to events
    const unsubscribeJoined = call.on('call.session_participant_joined', handleParticipantJoined);
    const unsubscribeLeft = call.on('call.session_participant_left', handleParticipantLeft);
    const unsubscribeStarted = call.on('call.session_started', handleSessionStarted);
    
    // Set initial session start time if available
    if (call.state.startedAt) {
      setSessionStartTime(new Date(call.state.startedAt));
    }
    
    // Cleanup subscriptions
    return () => {
      unsubscribeJoined();
      unsubscribeLeft();
      unsubscribeStarted();
    };
  }, [call, sessionStartTime]);

  // Copy meeting URL to clipboard
  const copyMeetingUrl = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        toast({
          title: "URL Copied!",
          description: "Meeting link has been copied to clipboard",
          variant: "default",
        });
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
        toast({
          title: "Copy failed",
          description: "Could not copy the URL",
          variant: "destructive",
        });
      });
  }, [toast]);
  
  // Copy meeting ID to clipboard
  const copyMeetingId = useCallback(() => {
    navigator.clipboard.writeText(meetingId)
      .then(() => {
        toast({
          title: "Meeting Code Copied!",
          description: "Meeting code has been copied to clipboard",
          variant: "default",
        });
      })
      .catch(err => {
        console.error('Failed to copy meeting code: ', err);
        toast({
          title: "Copy failed",
          description: "Could not copy the meeting code",
          variant: "destructive",
        });
      });
  }, [meetingId, toast]);

  // Generate shareable message
  const shareViaSocial = useCallback(() => {
    const text = `Join my OcuLink meeting: ${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'OcuLink Meeting Invitation',
        text,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(text)
        .then(() => {
          toast({
            title: "Message Copied!",
            description: "Share message has been copied to clipboard",
            variant: "default",
          });
        });
    }
  }, [toast]);

  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto">
      <div className="space-y-6">
        {/* Meeting Code */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Video size={18} /> Meeting Code
          </h3>
          <div className="flex items-center gap-2">
            <div className="bg-white border-2 border-black p-2 rounded-md flex-1 font-mono text-sm break-all truncate">
              {meetingId}
            </div>
            <Button 
              onClick={copyMeetingId}
              className="p-2 bg-green-300 hover:bg-green-400 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              aria-label="Copy meeting code"
            >
              <Copy size={18} />
            </Button>
          </div>
        </div>
        
        {/* Meeting Link */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Link size={18} /> Meeting Link
          </h3>
          <div className="flex items-center gap-2">
            <div className="bg-white border-2 border-black p-2 rounded-md flex-1 text-sm truncate">
              {window.location.href}
            </div>
            <Button 
              onClick={copyMeetingUrl}
              className="p-2 bg-green-300 hover:bg-green-400 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              aria-label="Copy meeting link"
            >
              <Copy size={18} />
            </Button>
          </div>
        </div>
        
        {/* Share button */}
        <Button 
          onClick={shareViaSocial}
          className="w-full bg-green-400 hover:bg-green-500 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] font-medium"
        >
          Share Invitation
        </Button>
        
        {/* Meeting Details */}
        <div className="bg-green-100 border-2 border-black rounded-md p-3 space-y-3">
          <h3 className="text-lg font-semibold">Meeting Details</h3>
          
          {/* Start Time */}
          {(sessionStartTime || call?.state.startedAt) && (
            <div className="flex items-start gap-2">
              <Calendar size={18} className="mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">Started</p>
                <p className="text-sm">
                  {sessionStartTime 
                    ? sessionStartTime.toLocaleString() 
                    : call?.state.startedAt 
                      ? new Date(call.state.startedAt).toLocaleString() 
                      : 'Not started yet'}
                </p>
              </div>
            </div>
          )}
          
          {/* Participants Count */}
          <div className="flex items-start gap-2">
            <Users size={18} className="mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">Participants</p>
              <p className="text-sm">{participantCount} connected</p>
            </div>
          </div>
        </div>
        
        {/* Call Status */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Call Status</h3>
          <div className={cn(
            "px-3 py-2 rounded-md border-2 border-black font-medium",
            callingState === 'joined' 
              ? "bg-green-400" 
              : callingState === 'reconnecting' 
                ? "bg-yellow-400" 
                : "bg-red-300"
          )}>
            {callingState === 'joined' 
              ? "Connected" 
              : callingState === 'reconnecting' 
                ? "Reconnecting..." 
                : "Disconnected"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingInfo;